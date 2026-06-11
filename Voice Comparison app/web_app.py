import os
import json
import hashlib
import shutil
import subprocess
from pathlib import Path
import traceback
import numpy as np
import pandas as pd
import matplotlib
# Use non-interactive backend for matplotlib to prevent GUI threading warnings/errors
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import umap
from flask import Flask, request, jsonify, render_template, send_from_directory, send_file

try:
    from resemblyzer import VoiceEncoder, preprocess_wav
except Exception as e:
    print("Warning: Voice Comparison app packages not found. Make sure venv is activated.")
    raise

app = Flask(__name__)

# Config
UPLOAD_DIR = Path("web_uploads").resolve()
PLOTS_DIR = Path("plots").resolve()
CACHE_FILE = Path("conversion_cache.json").resolve()

UPLOAD_DIR.mkdir(exist_ok=True)
PLOTS_DIR.mkdir(exist_ok=True)

# Global lazy-loaded encoder
encoder = None

def get_encoder(logger_func):
    global encoder
    if encoder is None:
        logger_func("Loading Voice Comparison model (this might take a moment)...")
        encoder = VoiceEncoder()
        logger_func("VoiceEncoder loaded successfully.")
    return encoder

# Cache utilities
def file_hash(path):
    h = hashlib.sha1()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(8192)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()[:12]

def load_cache():
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
    except Exception as e:
        print("Failed to save cache:", e)

CONVERSION_CACHE = load_cache()

def convert_to_wav(input_path, output_dir):
    """Convert input audio/video file to mono 16k WAV using ffmpeg."""
    input_path = Path(input_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    file_key = str(input_path.resolve())
    hash_value = file_hash(input_path)

    global CONVERSION_CACHE
    if file_key in CONVERSION_CACHE:
        stored_hash, wav_output = CONVERSION_CACHE[file_key]
        if stored_hash == hash_value and Path(wav_output).exists():
            return Path(wav_output)

    # Build output path
    stem = input_path.stem
    out = (output_dir / f"{stem}_converted.wav").resolve()

    cmd = [
        "ffmpeg",
        "-y",
        "-i", str(input_path),
        "-ac", "1",         # mono
        "-ar", "16000",     # 16 kHz
        str(out)
    ]

    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        CONVERSION_CACHE[file_key] = (hash_value, str(out))
        save_cache(CONVERSION_CACHE)
        return out
    except Exception:
        return None

# Routes
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/upload", methods=["POST"])
def upload_file():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        filename = file.filename
        # Clean filename and save
        dest_path = (UPLOAD_DIR / filename).resolve()
        file.save(str(dest_path))

        return jsonify({
            "filename": filename,
            "size": dest_path.stat().st_size
        })
    except Exception as e:
        print("Upload Error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/audio/<filename>")
def serve_audio(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.route("/api/compare", methods=["POST"])
def compare_voices():
    data = request.get_json() or {}
    reference = data.get("reference")
    comparison_files = data.get("files", [])

    if not reference:
        return jsonify({"error": "Reference file is required"}), 400
    if not comparison_files:
        return jsonify({"error": "At least one comparison file is required"}), 400

    logs = []
    def log(msg):
        logs.append(msg)
        print(msg)

    try:
        log("--- Starting Voice Comparison Processing ---")
        
        # 1. Convert reference
        ref_path = UPLOAD_DIR / reference
        if not ref_path.exists():
            return jsonify({"error": f"Reference file {reference} does not exist"}), 400
        
        log(f"Processing reference file: {reference}")
        if ref_path.suffix.lower() == ".wav":
            # Copy to a unique preprocessed name or use directly
            ref_wav = UPLOAD_DIR / f"{ref_path.stem}_converted.wav"
            shutil.copy(ref_path, ref_wav)
        else:
            ref_wav = convert_to_wav(ref_path, UPLOAD_DIR)
            if not ref_wav:
                return jsonify({"error": f"Failed to convert reference file {reference}"}), 500
        
        # 2. Convert comparisons
        wav_paths = []
        # Keep track of original names mapped to their processed wav paths
        orig_to_wav = {}
        
        # Reference is part of the set for embedding and plotting
        wav_paths.append(ref_wav)
        orig_to_wav[reference] = ref_wav
        
        for name in comparison_files:
            src_path = UPLOAD_DIR / name
            if not src_path.exists():
                log(f"Warning: comparison file {name} not found. Skipping.")
                continue
            
            if src_path.suffix.lower() == ".wav":
                dst_wav = UPLOAD_DIR / f"{src_path.stem}_converted.wav"
                shutil.copy(src_path, dst_wav)
                wav_paths.append(dst_wav)
                orig_to_wav[name] = dst_wav
                log(f"Using WAV: {name}")
            else:
                converted = convert_to_wav(src_path, UPLOAD_DIR)
                if converted:
                    wav_paths.append(converted)
                    orig_to_wav[name] = converted
                    log(f"Converted: {name} -> {converted.name}")
                else:
                    log(f"FAILED conversion: {name}")

        if len(wav_paths) < 2:
            return jsonify({"error": "Not enough valid audio files to compare. Need at least 1 reference and 1 comparison file."}), 400

        # 3. Load model
        encoder_instance = get_encoder(log)

        # 4. Compute embeddings
        embeddings = {}
        for orig_name, wav_p in orig_to_wav.items():
            log(f"Generating embedding for {orig_name}...")
            try:
                wav_arr = preprocess_wav(wav_p)
                emb = encoder_instance.embed_utterance(wav_arr)
                embeddings[orig_name] = emb
            except Exception as e:
                log(f"ERROR processing {orig_name}: {e}")

        if len(embeddings) < 2:
            return jsonify({"error": "Failed to extract embeddings for comparison."}), 500

        # 5. Compute similarities
        results = []
        ref_emb = embeddings[reference]
        
        for orig_name, emb in embeddings.items():
            if orig_name == reference:
                continue
            
            # cosine similarity (dot product of normalized embeddings)
            score = float(np.dot(ref_emb, emb))
            # classify strength
            if score > 0.80:
                status = "Near-identical voice"
            elif score > 0.68:
                status = "Similar"
            elif score > 0.50:
                status = "Weak similarity"
            else:
                status = "Not similar"
                
            results.append({
                "filename": orig_name,
                "similarity": score,
                "status": status
            })
            log(f"{orig_name} -> Similarity: {score:.3f} ({status})")

        # 6. UMAP Projection
        log("Computing UMAP 2D projection...")
        names = list(embeddings.keys())
        emb_matrix = np.vstack([embeddings[n] for n in names])
        
        proj = np.zeros((len(names), 2))
        if len(names) < 4:
            log(f"Dataset has only {len(names)} sample(s). Using distance-based coordinate mapping instead of UMAP.")
            ref_name = reference
            comp_idx = 0
            for i, name in enumerate(names):
                if name == ref_name:
                    proj[i] = [0.0, 0.0]
                else:
                    sim = float(np.dot(embeddings[ref_name], embeddings[name]))
                    dist = max(0.0, 1.0 - sim)
                    if comp_idx == 0:
                        proj[i] = [dist, 0.0]
                        comp_idx += 1
                    else:
                        proj[i] = [0.0, dist if comp_idx == 1 else -dist]
                        comp_idx += 1
        else:
            # Set n_neighbors to min(15, number of samples - 1) to avoid UMAP errors
            n_neighbors = min(15, len(names) - 1)
            reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=0.1, n_components=2, random_state=42)
            proj = reducer.fit_transform(emb_matrix)

        # Map project coords
        umap_coords = {}
        for i, n in enumerate(names):
            umap_coords[n] = {
                "x": float(proj[i, 0]),
                "y": float(proj[i, 1])
            }

        # Save outputs to files (like the GUI does)
        # CSV
        df = pd.DataFrame({
            "filename": names,
            "umap_x": proj[:, 0],
            "umap_y": proj[:, 1]
        })
        
        # Add 256-dim embedding features as columns
        dim = emb_matrix.shape[1]
        for col_idx in range(dim):
            df[f"e_{col_idx}"] = emb_matrix[:, col_idx]

        csv_path = PLOTS_DIR / "embeddings_gui.csv"
        df.to_csv(csv_path, index=False)
        log(f"Saved CSV: {csv_path}")

        # PNG Plot
        fig, ax = plt.subplots(figsize=(7, 5.5))
        ax.scatter(proj[:, 0], proj[:, 1], s=120, alpha=0.85, c='#4A90E2', edgecolors='white', linewidths=1.5)
        for i, n in enumerate(names):
            color = "#E94A4A" if n == reference else "#333333"
            ax.text(proj[i, 0] + 0.02, proj[i, 1] + 0.02, n, fontsize=9, color=color, fontweight='bold')
        ax.set_title("UMAP — Voice Embeddings Map", fontsize=12, fontweight='bold', pad=15)
        ax.set_xlabel("UMAP X Dimension")
        ax.set_ylabel("UMAP Y Dimension")
        ax.grid(True, linestyle='--', alpha=0.5)
        fig.tight_layout()
        
        png_path = PLOTS_DIR / "umap_gui.png"
        fig.savefig(png_path, dpi=200)
        plt.close(fig)
        log(f"Saved PNG: {png_path}")

        log("--- Processing complete ---")

        return jsonify({
            "reference": {
                "filename": reference,
                "umap": umap_coords[reference]
            },
            "comparisons": results,
            "umap_coords": umap_coords,
            "logs": "\n".join(logs)
        })

    except Exception as e:
        log(f"CRITICAL ERROR: {e}")
        log(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc(),
            "logs": "\n".join(logs)
        }), 500

@app.route("/api/download/csv")
def download_csv():
    csv_path = PLOTS_DIR / "embeddings_gui.csv"
    if csv_path.exists():
        return send_file(csv_path, mimetype="text/csv", as_attachment=True, download_name="embeddings.csv")
    return jsonify({"error": "Embeddings CSV has not been generated yet."}), 404

@app.route("/api/download/png")
def download_png():
    png_path = PLOTS_DIR / "umap_gui.png"
    if png_path.exists():
        return send_file(png_path, mimetype="image/png", as_attachment=True, download_name="umap_projection.png")
    return jsonify({"error": "UMAP plot PNG has not been generated yet."}), 404

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

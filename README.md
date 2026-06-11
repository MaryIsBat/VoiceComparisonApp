# Voice Comparison App (VoiceMatch AI)

Voice Comparison App allows you to derive a **high-level representation of a voice** through a deep learning model (referred to as the voice encoder). Given an audio file of speech, it creates a summary vector of 256 values (an embedding, often shortened to "embed" in this repo) that summarizes the characteristics of the voice spoken.

The pretrained model that comes with the Voice Comparison app is interchangeable with models trained in the Real-Time Voice Cloning repository, so feel free to finetune a model on new data and possibly new languages! The paper from which the voice encoder was implemented is [Generalized End-To-End Loss for Speaker Verification](https://arxiv.org/pdf/1710.10467.pdf) (in which it is called the *speaker* encoder).

---

## 🚀 Features

* **Interactive UMAP Scatter Plot**: Visualizes the relative distance of voices in a 2D space. Powered by Chart.js, allowing you to hover over points to see file details and scores.
* **Audio Previews**: Inline playback controls for the reference file and all comparison files.
* **Similarity Gauge & Rankings**: Instantly ranks comparison files from highest to lowest similarity with match strength status badges based on cosine similarity thresholds:
  * `Near-identical voice` (Score > 0.80)
  * `Similar` (Score > 0.68)
  * `Weak similarity` (Score > 0.50)
  * `Not similar` (Score ≤ 0.50)
* **Live System Console**: Real-time logging console reflecting backend processing steps (model loading, conversion status, etc.).
* **Automatic Preprocessing**: Built-in pipeline that automatically converts multi-format audio/video files to mono 16kHz WAV format using `ffmpeg`.
* **Conversion Caching**: Utilizes file hashing to cache converted assets, avoiding redundant rendering pipelines and speeding up repetitive tasks.
* **Exporting Results**: Download full 256-dimension embeddings as a `.csv` or save the UMAP projection map as a `.png`.

---

## 🛠️ Tech Stack & Dependencies

The backend application requires Python 3.5+ and relies on the following key dependencies listed in `requirements.txt`:

* **Web Framework**: `Flask` (>=3.1.3), `werkzeug` (>=3.0.0)
* **Data & Machine Learning**: `numpy`, `pandas`, `torch`, `umap-learn`
* **Audio Processing**: `librosa`, `webrtcvad`, `soundfile`
* **Visualization**: `matplotlib`

---

## ⚙️ Setup & Installation

### Prerequisites
* **Python 3.5+** is required.
* **ffmpeg**: Must be installed and configured on your system's PATH environment variable for automatic audio conversion to function properly.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/Voice-Comparison-app.git](https://github.com/YOUR_USERNAME/Voice-Comparison-app.git)
cd "Voice Comparison app"
```

### . Set Up the Virtual Environment

Create and activate your Python virtual environment to keep dependencies isolated:
Windows:
```bash
python -m venv venv
.\venv\Scripts\activate
```
macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install Dependencies

With your virtual environment activated, install the required packages:

```bash
pip install -r requirements.txt
```

Running the Application
Launching the Web Interface

To start the local web dashboard, make sure your virtual environment is active and run:

```bash
python web_app.py
```
Once the server initializes, open your web browser and navigate to:

```bash
[http://127.0.0.1:5000](http://127.0.0.1:5000)
```

Programmatic Usage Example

If you want to bypass the web UI and use the voice encoder directly in a Python script:
```Python
from resemblyzer import VoiceEncoder, preprocess_wav
from pathlib import Path
import numpy as np

# Load and preprocess your audio file
fpath = Path("path_to_an_audio_file")
wav = preprocess_wav(fpath)

# Extract the 256-dimension voice embedding
encoder = VoiceEncoder()
embed = encoder.embed_utterance(wav)

# Print formatting
np.set_printoptions(precision=3, suppress=True)
print(embed)
```

se Cases

Voice Comparison app has many uses:

    Voice similarity metric: Compare different voices and get a value on how similar they sound. This leads to other applications:

        Speaker verification: Create a voice profile for a person from a few seconds of speech (5s - 30s) and compare it to that of new audio. Reject similarity scores below a threshold.

        Speaker diarization: Figure out who is talking when by comparing voice profiles with the continuous embedding of a multispeaker speech segment.

        Fake speech detection: Verify if some speech is legitimate or fake by comparing the similarity of possible fake speech to real speech.

    High-level feature extraction: You can use the embeddings generated as feature vectors for machine learning or data analysis. This also leads to other applications:

        Voice cloning: See the Real-Time Voice Cloning project.

        Component analysis: Figure out accents, tones, prosody, gender, etc., through a component analysis of the embeddings.

        Virtual voices: Create entirely new voice embeddings by sampling from a prior distribution.

    Loss function: You can backpropagate through the voice encoder model and use it as a perceptual loss for your deep learning model! The voice encoder is written in PyTorch.

  📂 Project Workspace Structure
Voice Comparison app/
```
│
├── web_app.py              # Main Flask application (APIs, audio pipeline, caching)
├── requirements.txt         # List of dependencies (Flask, PyTorch, UMAP, etc.)
├── conversion_cache.json    # Local cache tracking processed audio hashes
├── .gitignore               # Excludes environment folders, local uploads, and cache files
│
├── web_uploads/             # Local target directory for client-uploaded audio files
├── plots/                   # Saved artifacts (`embeddings_gui.csv` and `umap_gui.png`)
│
└── templates/
    └── index.html           # Front-end dashboard user interface
```

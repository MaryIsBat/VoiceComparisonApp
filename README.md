# Voice Comparison App (VoiceMatch AI)

Voice Comparison App allows you to derive a **high-level representation of a voice** through a deep learning model (referred to as the voice encoder). Given an audio file of speech, it creates a summary vector of 256 values (an embedding) that captures the unique characteristics of the spoken voice.

---

## 🚀 Features

* **Interactive UMAP Scatter Plot**: Visualizes the relative geometric distance of voices in a 2D space via Chart.js, allowing you to hover over points to see file details and scores.
* **Audio Previews**: Inline playback controls for the reference file and all comparison files directly within the dashboard.
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

## ⚙️ Setup & Installation

### Prerequisites
* **Python 3.5+**
* **ffmpeg**: Must be installed and configured on your system's PATH environment variable for automatic audio conversion to function properly.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/Voice-Comparison-app.git](https://github.com/YOUR_USERNAME/Voice-Comparison-app.git)
cd "Voice Comparison app"

2. Set Up the Virtual Environment

Create and activate your Python virtual environment to keep dependencies isolated:

    Windows:
    Bash

    python -m venv venv
    .\venv\Scripts\activate

    macOS/Linux:
    Bash

    python3 -m venv venv
    source venv/bin/activate

3. Install Dependencies

With your virtual environment activated, install the required packages:
Bash

pip install -r requirements.txt

(Alternatively, to get the core programmatic package alone, you can run: pip install resemblyzer)
💻 Running the Application
Launching the Web Interface

To start the local web dashboard, make sure your virtual environment is active and run:
Bash

python web_app.py

Once the server initializes, open your web browser and navigate to:
Plaintext

[http://127.0.0.1:5000](http://127.0.0.1:5000)

Programmatic Usage Example

If you want to bypass the web UI and use the voice encoder directly in a Python script:
Python

from resemblyzer import VoiceEncoder, preprocess_wav
from pathlib import Path
import numpy as np

# Load and preprocess your audio file
fpath = Path("path_to_an_audio_file.wav")
wav = preprocess_wav(fpath)

# Extract the 256-dimension voice embedding
encoder = VoiceEncoder()
embed = encoder.embed_utterance(wav)

# Print formatting
np.set_printoptions(precision=3, suppress=True)
print(embed)

🎯 Use Cases

    Voice Similarity Metric: Compare different voices to evaluate how closely they match, independent of volume or spoken words.

    Speaker Verification: Create a unique voice profile from a brief segment of speech (5s - 30s) and reject inputs below a chosen match threshold.

    Speaker Diarization: Determine who is speaking and exactly when within a continuous multi-speaker audio segment.

    Fake Speech Detection: Verify audio legitimacy by evaluating suspicious clips against trusted ground truth files.

    Feature Extraction & Loss Functions: Extract voice fingerprints to use as foundational data vectors for downstream machine learning tasks, voice cloning, or pass gradients through the encoder as a perceptual loss function.

📂 Project Workspace Structure
Plaintext

Voice Comparison app/
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

📝 Technical Background

The voice encoder implementation is modeled on the paper Generalized End-To-End Loss for Speaker Verification. The architecture runs efficiently on both CPU and GPU environments, executing processes at approximately 1000x real-time on a GTX 1080 (with a minimum of 10ms for I/O operations). It is highly robust to background noise and optimized for English speech.# Voice Comparison App (VoiceMatch AI)

[cite_start]Voice Comparison App allows you to derive a **high-level representation of a voice** through a deep learning model (referred to as the voice encoder). [cite_start]Given an audio file of speech, it creates a summary vector of 256 values (an embedding, often shortened to "embed" in this repo) that summarizes the characteristics of the voice spoken.

[cite_start]The pretrained model that comes with the Voice Comparison app is interchangeable with models trained in the Real-Time Voice Cloning repository, so feel free to finetune a model on new data and possibly new languages! [cite: 1] [cite_start]The paper from which the voice encoder was implemented is [Generalized End-To-End Loss for Speaker Verification](https://arxiv.org/pdf/1710.10467.pdf) (in which it is called the *speaker* encoder).

---

## 🚀 Features

* [cite_start]**Interactive UMAP Scatter Plot**: Visualizes the relative distance of voices in a 2D space. [cite_start]Powered by Chart.js, allowing you to hover over points to see file details and scores.
* [cite_start]**Audio Previews**: Inline playback controls for the reference file and all comparison files.
* [cite_start]**Similarity Gauge & Rankings**: Instantly ranks comparison files from highest to lowest similarity with match strength status badges based on cosine similarity thresholds:
  * [cite_start]`Near-identical voice` (Score > 0.80) 
  * [cite_start]`Similar` (Score > 0.68) 
  * [cite_start]`Weak similarity` (Score > 0.50) 
  * [cite_start]`Not similar` (Score ≤ 0.50) 
* [cite_start]**Live System Console**: Real-time logging console reflecting backend processing steps (model loading, conversion status, etc.).
* [cite_start]**Automatic Preprocessing**: Built-in pipeline that automatically converts multi-format audio/video files to mono 16kHz WAV format using `ffmpeg`.
* [cite_start]**Conversion Caching**: Utilizes file hashing to cache converted assets, avoiding redundant rendering pipelines and speeding up repetitive tasks.
* [cite_start]**Exporting Results**: Download full 256-dimension embeddings as a `.csv` or save the UMAP projection map as a `.png`.

---

## 🛠️ Tech Stack & Dependencies

[cite_start]The backend application requires Python 3.5+ and relies on the following key dependencies listed in `requirements.txt`:

* [cite_start]**Web Framework**: `Flask` (>=3.1.3), `werkzeug` (>=3.0.0) [cite: 2]
* [cite_start]**Data & Machine Learning**: `numpy`, `pandas`, `torch`, `umap-learn` [cite: 2]
* [cite_start]**Audio Processing**: `librosa`, `webrtcvad`, `soundfile` [cite: 2]
* [cite_start]**Visualization**: `matplotlib` [cite: 2]

---

## ⚙️ Setup & Installation

### Prerequisites
* [cite_start]**Python 3.5+** is required.
* [cite_start]**ffmpeg**: Must be installed and configured on your system's PATH environment variable for automatic audio conversion to function properly.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/Voice-Comparison-app.git](https://github.com/YOUR_USERNAME/Voice-Comparison-app.git)
cd "Voice Comparison app"
2. Set Up the Virtual Environment
Create and activate your Python virtual environment to keep dependencies isolated:

Windows:
python -m venv venv
.\venv\Scripts\activate

macOS/Linux:
python3 -m venv venv
source venv/bin/activate

3. Install Dependencies
With your virtual environment activated, install the required packages:

pip install -r requirements.txt

(Alternatively, to get the core programmatic package alone, you can run: pip install resemblyzer)   

💻 Running the Application

Launching the Web Interface
To start the local web dashboard, make sure your virtual environment is active and run:  

python web_app.py

Once the server initializes, open your web browser and navigate to:
http://127.0.0.1:5000

Programmatic Usage Example
If you want to bypass the web UI and use the voice encoder directly in a Python script:  

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

🎯 Use Cases
Voice Comparison app has many uses:  

- Voice similarity metric: Compare different voices and get a value on how similar they sound. This leads to other applications:  

- Speaker verification: Create a voice profile for a person from a few seconds of speech (5s - 30s) and compare it to that of new audio. Reject similarity scores below a threshold.  

- Speaker diarization: Figure out who is talking when by comparing voice profiles with the continuous embedding of a multispeaker speech segment.  

- Fake speech detection: Verify if some speech is legitimate or fake by comparing the similarity of possible fake speech to real speech.  

- High-level feature extraction: You can use the embeddings generated as feature vectors for machine learning or data analysis. This also leads to other applications:  

- Voice cloning: See the Real-Time Voice Cloning project.  

- Component analysis: Figure out accents, tones, prosody, gender, etc., through a component analysis of the embeddings.  

- Virtual voices: Create entirely new voice embeddings by sampling from a prior distribution.  

- Loss function: You can backpropagate through the voice encoder model and use it as a perceptual loss for your deep learning model! The voice encoder is written in PyTorch.  

📂 Project Workspace Structure

Voice Comparison app/
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

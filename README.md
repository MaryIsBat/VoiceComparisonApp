# Voice Comparison App (VoiceMatch AI)

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

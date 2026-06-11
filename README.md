# Voice Comparison App (VoiceMatch AI)

[cite_start]The Voice Comparison App allows you to derive a **high-level representation of a voice** through a deep learning model (referred to as the voice encoder). [cite_start]Given an audio file of speech, it creates a summary vector of 256 values (an embedding) that summarizes the characteristics of the voice spoken. 

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
* [cite_start]**Conversion Caching**: Utilizes file hashing to cache converted assets, avoiding redundant rendering pipelines.
* [cite_start]**Exporting Results**: Download full 256-dimension embeddings as a `.csv` or save the UMAP projection map as a `.png`.

---

## 🛠️ Tech Stack & Dependencies

[cite_start]The backend application requires Python 3.5+  [cite_start]and relies on the following key dependencies listed in `requirements.txt`[cite: 2]:

* [cite_start]**Web Framework**: `Flask` (>=3.1.3), `werkzeug` (>=3.0.0) [cite: 2]
* [cite_start]**Data & Machine Learning**: `numpy`, `pandas`, `torch`, `umap-learn` [cite: 2]
* [cite_start]**Audio Processing**: `librosa`, `webrtcvad`, `soundfile` [cite: 2]
* [cite_start]**Visualization**: `matplotlib` [cite: 2]

---

## ⚙️ Setup & Installation

### Prerequisites
[cite_start]Make sure you have Python 3.5+ installed. [cite_start]You must also have `ffmpeg` installed and configured on your system's PATH environmental variable for dynamic audio conversion.

### 1. Set Up the Virtual Environment
[cite_start]Activate your Python virtual environment:

* **Windows:**
  ```bash
  .\venv\Scripts\activate

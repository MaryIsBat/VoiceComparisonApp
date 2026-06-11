Voice Comparison app allows you to derive a **high-level representation of a voice** through a deep learning model (referred to as the voice encoder). Given an audio file of speech, it creates a summary vector of 256 values (an embedding, often shortened to "embed" in this repo) that summarizes the characteristics of the voice spoken. 

N.B.: this repo holds 100mb of audio data for demonstration purpose. To get [the package](https://pypi.org/project/Voice Comparison app/) alone, run `pip install resemblyzer` (python 3.5+ is required).

## Demos
**Speaker diarization**: [\[Demo 02\]](https://github.com/resemble-ai/Voice Comparison app/blob/master/demo02_diarization.py) recognize who is talking when with only a few seconds of reference audio per speaker:  
*(click the image for a video)*

[![demo_02](https://i.imgur.com/2MpNauG.png)](https://streamable.com/uef39)

**Fake speech detection**: [\[Demo 05\]](https://github.com/resemble-ai/Voice Comparison app/blob/master/demo05_fake_speech_detection.py) modest detection of fake speech by comparing the similarity of 12 unknown utterances (6 real ones, 6 fakes) against ground truth reference audio. Scores above the dashed line are predicted as real, so the model makes one error here.

![demo_05](plots/fake_speech_detection.png?raw=true)

For reference, [this](https://www.youtube.com/watch?v=Ho9h0ouemWQ) is the fake video that achieved a high score.

**Visualizing the manifold**:  
[\[Demo 03 - left\]](https://github.com/resemble-ai/Voice Comparison app/blob/master/demo03_projection.py) projecting the embeddings of 100 utterances (10 each from 10 speakers) in 2D space. The utterances from the same speakers form a tight cluster. With a trivial clustering algorithm, the speaker verification error rate for this example (with data unseen in training) would be 0%.  
[\[Demo 04 - right\]](https://github.com/resemble-ai/Voice Comparison app/blob/master/demo04_clustering.py) same as demo 03 but with 251 embeddings all from distinct speakers, highlighting that the model has learned on its own to identify the sex of the speaker.

![demo_03_04](plots/all_clustering.png?raw=true)

**Cross-similarity**: [\[Demo 01\]](https://github.com/resemble-ai/Voice Comparison app/blob/master/demo01_similarity.py) comparing 10 utterances from 10 speakers against 10 other utterances from the same speakers.

![demo_01](plots/sim_matrix_1.png?raw=true)



## What can I do with this package?
Voice Comparison app has many uses:
- **Voice similarity metric**: compare different voices and get a value on how similar they sound. This leads to other applications:
  - **Speaker verification**: create a voice profile for a person from a few seconds of speech (5s - 30s) and compare it to that of new audio. Reject similarity scores below a threshold.
  - **Speaker diarization**: figure out who is talking when by comparing voice profiles with the continuous embedding of a multispeaker speech segment.
  - **Fake speech detection**: verify if some speech is legitimate or fake by comparing the similarity of possible fake speech to real speech.
- **High-level feature extraction**: you can use the embeddings generated as feature vectors for machine learning or data analysis. This also leads to other applications:
  - **Voice cloning**: see [this other project](https://github.com/CorentinJ/Real-Time-Voice-Cloning).
  - **Component analysis**: figure out accents, tones, prosody, gender, ... through a component analysis of the embeddings.
  - **Virtual voices**: create entirely new voice embeddings by sampling from a prior distribution.
- **Loss function**: you can backpropagate through the voice encoder model and use it as a perceptual loss for your deep learning model! The voice encoder is written in PyTorch.

Voice Comparison app is fast to execute (around 1000x real-time on a GTX 1080, with a minimum of 10ms for I/O operations), and can run both on CPU or GPU. It is robust to noise. It currently works best on English language only, but should still be able to perform somewhat decently on other languages.


## Code example
This is a short example showing how to use Voice Comparison app:
```python
from resemblyzer import VoiceEncoder, preprocess_wav
from pathlib import Path
import numpy as np

fpath = Path("path_to_an_audio_file")
wav = preprocess_wav(fpath)

encoder = VoiceEncoder()
embed = encoder.embed_utterance(wav)
np.set_printoptions(precision=3, suppress=True)
print(embed)
```

I highly suggest giving a peek to the demos to understand how similarity is computed and to see practical usages of the voice encoder.

## Web Application (VoiceMatch AI)
We have added a modern, web-based interface for voice comparison that extends the features of `voice_gui_optimized.py`. 

### Features:
- **Interactive UMAP Scatter Plot**: Visualizes the relative distance of voices in a 2D space. Powered by Chart.js, allowing you to hover over points to see file details and scores.
- **Audio Previews**: Inline playback controls for the reference file and all comparison files.
- **Similarity Gauge & Rankings**: Instantly ranks comparison files from highest to lowest similarity with match strength status badges.
- **Live System Console**: Real-time logging console reflecting backend processing steps (model loading, conversion status, etc.).
- **Exporting Results**: Download full 256-dimension embeddings as a `.csv` or save the UMAP projection map as a `.png`.

### Running the Web App:
```bash
# 1. Activate the virtual environment
.\venv\Scripts\activate

# 2. Run the server
python web_app.py
```
Open your browser to `http://127.0.0.1:5000` to start using it.

## Additional info
Voice Comparison app emerged as a side project of the [Real-Time Voice Cloning](https://github.com/CorentinJ/Real-Time-Voice-Cloning) repository. The pretrained model that comes with Voice Comparison app is interchangeable with models trained in that repository, so feel free to finetune a model on new data and possibly new languages! The paper from which the voice encoder was implemented is [Generalized End-To-End Loss for Speaker Verification](https://arxiv.org/pdf/1710.10467.pdf) (in which it is called the *speaker* encoder).


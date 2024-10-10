# memmy

`memmy` is a simple command line tool to help you remember and recall information.
It allows you to record voice notes, transcribe and generate embeddings for them, and then recall them later using a natural language interface. All models are locally run on your machine:
- LLM: Llama 3.2 1B provided by ollama
- Embeddings: mxbai-embed-large provided by ollama
- Transcription: whisper from ggerganov's whisper.cpp
- Vector Database: json file via vectra

## Requirements
I've only tested this on MacOS. You need to have:
- node
- make
- sox

## Installation
Download this repo and run the following make command to install memmy:
```bash
npm install -g .
```
Before running `memmy` for the first time, you need to setup ollama:
```bash
make ollama_setup
```
This will download the embedding model, the llama language model and run the ollama server.

## Usage
```bash
memmy remember
```
This will start a recording prompt. When you're finished, it will transcribe and store the audio as a vector embedding.

```bash
memmy recall
```
This will prompt you to enter a query and then search the vector embedding database for similar notes.

On memmy's first run it will download the specified whisper model in your .env file (see .env.example). It will also initalize your local vector database.

To purge the vector database, run:
```bash
memmy purge
```



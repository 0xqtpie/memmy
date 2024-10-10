.PHONY: ollama_setup

LLM_MODEL ?= llama3.2:3b
EMBEDDING_MODEL ?= mxbai-embed-large

install_memmy:
	npm i && \
	npm run build && \
	npm link .

uninstall_memmy:
	npm unlink . && \
	npm rm --global memmy

ollama_server:
	docker rm -f ollama && \
	docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama && \
	docker exec -it ollama ollama pull $(LLM_MODEL) && \
	docker exec -it ollama ollama pull $(EMBEDDING_MODEL)

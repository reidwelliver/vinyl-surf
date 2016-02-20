FROM reidwelliver/vs-base:latest
MAINTAINER Reid Welliver

# Add this folder to the container's image at /git
COPY . /build/

RUN /build/utils/builder

# Entrypoint command
ENTRYPOINT ["/bin/bash"]
CMD ["/build/utils/run-wakeup"]

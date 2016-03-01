FROM reidwelliver/vs-base:latest
MAINTAINER Reid Welliver

ARG PROJECT

# Add this folder to the container's image at /git
COPY ./buildutils/utils/ /utils/
COPY ./$PROJECT/ /project/

RUN /utils/builder

# Entrypoint command
ENTRYPOINT ["/bin/bash"]
CMD ["/utils/run-wakeup"]

#!/bin/bash

cd /project/node
npm install mysql stompjs crypto fs ws
node auth/server.js
/bin/bash

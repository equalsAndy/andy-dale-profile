#!/bin/bash

# Define ports to check
PORTS=(5001 3000)

for PORT in "${PORTS[@]}"
do
    # Check if the port is in use
    PID=$(lsof -ti :$PORT)
    if [ -n "$PID" ]; then
        echo "Port $PORT is in use by process $PID. Killing it..."
        kill -9 $PID
        echo "Process $PID killed."
    else
        echo "Port $PORT is not in use."
    fi
done
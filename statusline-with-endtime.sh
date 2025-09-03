#!/bin/bash

# Get the original statusline output
original_output=$(bun x ccusage statusline "$@")

# Check if there's a time remaining pattern like "2h 45m left"
if [[ $original_output =~ ([0-9]+)h\ ([0-9]+)m\ left ]]; then
    hours=${BASH_REMATCH[1]}
    minutes=${BASH_REMATCH[2]}
    
    # Calculate end time
    end_time=$(date -v+${hours}H -v+${minutes}M "+%H:%M")
    
    # Replace "left" with "ends $end_time"
    echo "$original_output" | sed "s/left/ends $end_time/"
elif [[ $original_output =~ ([0-9]+)m\ left ]]; then
    minutes=${BASH_REMATCH[1]}
    
    # Calculate end time (minutes only)
    end_time=$(date -v+${minutes}M "+%H:%M")
    
    # Replace "left" with "ends $end_time"
    echo "$original_output" | sed "s/left/ends $end_time/"
else
    # No time remaining found, output original
    echo "$original_output"
fi
#!/bin/bash

# Get the original ccusage output to extract block time info
ccusage_output=$(bun x ccusage statusline "$@" 2>/dev/null)

# Extract model info and convert to readable format
model="Unknown"
if [[ $ccusage_output =~ 🤖\ ([^\ |]+) ]]; then
    raw_model=${BASH_REMATCH[1]}
    case $raw_model in
        "Opus") model="Opus 4" ;;
        "Sonnet") model="Sonnet 4" ;;
        "Haiku") model="Haiku 4" ;;
        *) model="$raw_model" ;;
    esac
fi

# Get git repo name
repo_name=$(basename $(git remote get-url origin 2>/dev/null) 2>/dev/null | sed 's/\.git$//' 2>/dev/null)
if [[ -z "$repo_name" ]]; then
    repo_name=$(basename $(pwd))
fi

# Calculate block end time in 12-hour format
end_time="N/A"
if [[ $ccusage_output =~ ([0-9]+)h\ ([0-9]+)m\ left ]]; then
    hours=${BASH_REMATCH[1]}
    minutes=${BASH_REMATCH[2]}
    end_time=$(date -v+${hours}H -v+${minutes}M "+%I:%M%p" | sed 's/^0//' | tr '[:upper:]' '[:lower:]')
elif [[ $ccusage_output =~ ([0-9]+)m\ left ]]; then
    minutes=${BASH_REMATCH[1]}
    end_time=$(date -v+${minutes}M "+%I:%M%p" | sed 's/^0//' | tr '[:upper:]' '[:lower:]')
fi

echo "$model | Git | $end_time"
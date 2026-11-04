"""Compatibility entrypoint for reading the linked Hermes model inventory.

The backend uses hermes_bridge.py for account management and model requests.
No credentials are returned by either inventory command.
"""
import json
import sys
from hermes_bridge import model_options

if __name__ == '__main__':
    if len(sys.argv) < 2 or sys.argv[1] != 'options':
        raise SystemExit('Use the private Hermes bridge for model requests.')
    sys.__stdout__.write(json.dumps(model_options('refresh' in sys.argv[2:])) + '\n')

from flask import Flask,make_response, request, jsonify
import logging
from implement import a

app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG)

@app.route('/run-script', methods=['POST'])
def run_script():
    try:
        logging.info('Running the Python script...')
        resp = a()
        logging.info(resp)
        resp = make_response(resp)
        logging.info('Script ran successfully  1')
        resp.headers['Access-Control-Allow-Origin'] = '*'
        logging.info('Script ran successfully.')
        return resp
    except Exception as e:
        logging.error(f'Error running script: {str(e)}')
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)

from flask import Response
import flask
from app.backend.device import device as dlsdevice


device = flask.Blueprint(__name__, __name__)


@device.route('/info', methods=["GET"])
def get_system_info():

    return Response(dlsdevice.generate_system_info(), mimetype='application/json')

@device.route('/available', methods=["GET"])
def get_available_devices():
    return Response(dlsdevice.get_available_devices_list_json(), mimetype='application/json')
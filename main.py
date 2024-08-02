from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

def get_network_info():
    try:
        blockreward_response = requests.get('https://api.spectre-network.org/info/blockreward?stringOnly=false', headers={'accept': 'application/json'})
        blockreward = blockreward_response.json().get('blockreward')

        hashrate_response = requests.get('https://api.spectre-network.org/info/hashrate?stringOnly=false', headers={'accept': 'application/json'})
        network_hashrate = hashrate_response.json().get('hashrate')  # in TH/s

        return blockreward, network_hashrate
    except Exception as e:
        print(f"An error occurred while fetching network info: {e}")
        return None, None

def rewards_in_range(blockreward, blocks):
    return blockreward * blocks

def get_mining_rewards(blockreward, percent_of_network):
    rewards = dict()
    rewards['second'] = rewards_in_range(blockreward, 1) * percent_of_network
    rewards['minute'] = rewards_in_range(blockreward, 60) * percent_of_network
    rewards['hour'] = rewards_in_range(blockreward, 60*60) * percent_of_network
    rewards['day'] = rewards_in_range(blockreward, 60*60*24) * percent_of_network
    rewards['week'] = rewards_in_range(blockreward, 60*60*24*7) * percent_of_network
    rewards['month'] = rewards_in_range(blockreward, 60*60*24*(365.25/12)) * percent_of_network
    rewards['year'] = rewards_in_range(blockreward, 60*60*24*365.25) * percent_of_network
    return rewards

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_rewards', methods=['POST'])
def get_rewards():
    data = request.json
    own_hashrate_khs = data.get('own_hashrate_khs', 0)
    
    blockreward, network_hashrate_ths = get_network_info()
    if blockreward is not None and network_hashrate_ths is not None:
        own_hashrate_ths = own_hashrate_khs / 1_000_000_000  # Convert kH/s to TH/s
        percent_of_network = own_hashrate_ths / float(network_hashrate_ths)

        rewards = get_mining_rewards(blockreward, percent_of_network)
        network_hashrate_mhs = float(network_hashrate_ths) * 1_000_000  # Convert TH/s to MH/s
        return jsonify({
            'network_hashrate_mhs': network_hashrate_mhs,
            'blockreward': blockreward,
            'percent_of_network': percent_of_network,
            'rewards': rewards
        })
    else:
        return jsonify({'error': 'Failed to retrieve network information'}), 500

if __name__ == "__main__":
    app.run(debug=True)

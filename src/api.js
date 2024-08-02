import axios from 'axios';

// Function to fetch network info from API
export async function fetchNetworkInfo() {
    try {
        const blockrewardResponse = await axios.get('https://api.spectre-network.org/info/blockreward?stringOnly=false');
        const blockreward = blockrewardResponse.data.blockreward;

        const hashrateResponse = await axios.get('https://api.spectre-network.org/info/hashrate?stringOnly=false');
        const networkHashrate = hashrateResponse.data.hashrate;  // in TH/s

        return { blockreward, networkHashrate };
    } catch (error) {
        console.error("An error occurred while fetching network info:", error);
        throw error;
    }
}

// Function to calculate mining rewards
export function getMiningRewards(blockreward, percentOfNetwork) {
    const rewardsInRange = (blockreward, blocks) => blockreward * blocks;

    return {
        second: rewardsInRange(blockreward, 1) * percentOfNetwork,
        minute: rewardsInRange(blockreward, 60) * percentOfNetwork,
        hour: rewardsInRange(blockreward, 3600) * percentOfNetwork,
        day: rewardsInRange(blockreward, 86400) * percentOfNetwork,
        week: rewardsInRange(blockreward, 604800) * percentOfNetwork,
        month: rewardsInRange(blockreward, 2629746) * percentOfNetwork,  // Approximate days in month
        year: rewardsInRange(blockreward, 31556952) * percentOfNetwork, // Approximate days in year
    };
}

const axios = require('axios');

async function fetchItem(itemName) {
    let result;
    const axiosRequest = axios.create({
        baseURL:`https://api.warframe.market/v1/items/${(itemName.toLowerCase()).replace(/ /g, "_")}/orders`
    });
    axiosRequest.interceptors.response.use(res => {
        let allOrders = res.data.payload.orders;

        return allOrders.map(({
            order_type,
            platinum,
            user
        }) => {
            let status = user.status;
            let playername = user.ingame_name
            return {
                order_type,
                platinum,
                status,
                playername
            }
        });
    });
    return axiosRequest.get().then((res)=> {
        return res;
    });
};

exports.fetchItem = fetchItem;
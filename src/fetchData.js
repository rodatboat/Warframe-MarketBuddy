const axios = require('axios');

async function fetchItem(itemName) {
    const axiosRequest = axios.create({
        baseURL:`https://api.warframe.market/v1/items/${(itemName.toLowerCase()).replace(/ /g, "_")}/orders`
    });
    axiosRequest.interceptors.response.use(res => {
        let allOrders = res.data.payload.orders;

        return allOrders.map(({
            order_type,
            platinum,
            user,
            quantity
        }) => {
            let status = user.status;
            let playername = user.ingame_name
            return {
                order_type,
                platinum,
                status,
                playername,
                quantity
            }
        });
    });
    return axiosRequest.get().then((res)=> {
        return res;
    });
};

async function fetchItemNames(){
    const axiosRequest = axios.create({
        baseURL:`https://api.warframe.market/v1/items`
    });
    axiosRequest.interceptors.response.use(res => {
        let allOrders = res.data.payload.items;

        return allOrders.map(({
            item_name,
            url_name,
            thumb
        }) => ({
                item_name,
                url_name,
                thumb,
        }));
    });
    return axiosRequest.get().then((res)=> {
        return res;
    });
}

exports.fetchItem = fetchItem;
exports.fetchItemNames = fetchItemNames;
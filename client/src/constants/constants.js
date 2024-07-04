export const BASE_URL = 'http://localhost:8989/api';
export const BASE_URL_2 = 'http://localhost:8989';
export const MAX_FILE_SIZE = 10485760; // 10 MB
export const DEFAULT_TIMEOUT = 5000; // 5 seconds
const authToken = localStorage.getItem("authToken") || ""

import axios from 'axios';
const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'apikey': 'JHDKJAHDCJHB5DVS5RB51DGB25R2DFE4DA54GW',
    // 'token': 'your-token',
    'Authorization': 'Bearer ' + authToken,
}

export const createAPI = async (apiRoute, data) => {
    try {
        const response = await axios.post(`${BASE_URL}${apiRoute}`, data, { headers });
        return response.data;
    } catch (error) {
        console.error('Error creating item:', error);
        return error.response.data
    }
}

export const getAPI = async (apiRoute, data) => {
    try {
        const response = await axios.post(`${BASE_URL}${apiRoute}`, data, { headers });
        return response.data;
    } catch (error) {
        console.error('Error getting items:', error);
        return error.response.data;
    }
}

export const getItemByIdAPI = async (apiRoute, id) => {
    try {
        const response = await axios.get(`${BASE_URL}${apiRoute}/${id}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error getting item by ID:', error);
        throw error;
    }
}

export const updateAPI = async (apiRoute, data) => {
    try {
        const response = await axios.put(`${BASE_URL}${apiRoute}`, data, { headers });
        return response.data;
    } catch (error) {
        console.error('Error updating item:', error);
        return error.response.data
    }

}

export const deleteAPI = async (apiRoute, id) => {
    try {
        const response = await axios.delete(`${BASE_URL}/${apiRoute}/${id}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Error deleting item:', error);
        return error.response.data
        // throw error;
    }
}

export const fileUploadAPI = async (apiRoute, file) => {
    try {
        let date = new Date();
        var mime = file?.file?.name?.split('.')[file?.file.name?.split('.').length - 1]
        let numericDate = parseInt(`${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + date.getSeconds()).slice(-2)}${('00' + date.getMilliseconds()).slice(-3)}`);
        var URL = numericDate + '.' + mime

        const formData = new FormData();
        formData.append('Image', file.file);
        formData.append('Name', URL);

        const response = await axios.post(`${BASE_URL_2}${apiRoute}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                apikey: "API_KEY",
                wpclientId: file.wpClientId,
            }
        });

        if (response.data.status === true) return { ...response.data, fileName: URL }
        else return response.data
    } catch (error) {
        console.error('Upload Error:', error);
        return error.response.data
    }
};



export const loginAPI = async (apiRoute, data) => {
    try {
        const response = await axios.post(`${BASE_URL_2}${apiRoute}`, data, { headers });
        return response.data;
    } catch (error) {
        console.error('Error creating item:', error);
        return error.response.data
    }
}

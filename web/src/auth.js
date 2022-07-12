export const isAuthenticated = () => {
    return localStorage.getItem("myFlowchart@token") ? true : false;
};

export const getAuthLevel = () => {
    return localStorage.getItem("myFlowchart@role");
};

export const deleteCredentials = () => {
    localStorage.removeItem("myFlowchart@token");
    localStorage.removeItem("myFlowchart@role");
    localStorage.removeItem("myFlowchart@flowchart");
};
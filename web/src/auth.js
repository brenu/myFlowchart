export const isAuthenticated = () => {
    return localStorage.getItem("myFlowchart@token") ? true : false;
};

export const getAuthLevel = () => {
    return localStorage.getItem("myFlowchart@role");
};
export const isAuthenticated = () => {
    return true;
};

export const getAuthLevel = () => {
    return localStorage.getItem("myFlowchart@auth");
};
// TODO: improve backlog identifier: asset.hasOwnProperty('assignee')

const inBacklog = (asset) => {
    return asset.hasOwnProperty('assignee');
};

export default inBacklog;

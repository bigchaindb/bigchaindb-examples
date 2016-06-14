
const filterByType = ({ condition, typeId, maxDepth }) => {
    let res = [];
    if (condition.hasOwnProperty('type_id') && condition.type_id === typeId) {
        res.push(condition);
    }

    const nextMaxDepth = (maxDepth === parseInt(maxDepth, 10)) ? maxDepth - 1 : null;

    if (condition.hasOwnProperty('subfulfillments') && (nextMaxDepth > -1)) {
        Object.values(condition.subfulfillments).forEach((subcondition) => {
            res = res.concat(filterByType({
                condition: subcondition,
                typeId,
                maxDepth: nextMaxDepth
            }));
        });
    }

    return res;
};


export default filterByType;

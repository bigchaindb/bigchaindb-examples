
const filterByType = ({ condition, typeId, maxDepth }) => {
    let res = [];
    if (condition.hasOwnProperty('type_id') && condition.type_id === typeId) {
        res.push(condition);
    }

    if (condition.hasOwnProperty('subfulfillments') && (maxDepth || maxDepth == null)) {
        res = res.concat(...Object.values(condition.subfulfillments).map((subcondition) => {
            return filterByType({
                typeId,
                condition: subcondition,
                maxDepth: maxDepth && maxDepth - 1
            });
        }));
    }

    return res;
};


export default filterByType;

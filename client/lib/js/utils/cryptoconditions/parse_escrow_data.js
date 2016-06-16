import filterByType from './filter_by_type';
import TypeIds from './type_ids';


const filterChildrenByTypes = ({ condition, types }) => {
    if (condition.hasOwnProperty('subfulfillments')) {
        const children = Object.values(types)
            .map((type) => {
                return filterByType({
                    condition,
                    typeId: type,
                    maxDepth: 1
                });
            })
            .reduce((a, b) => a.concat(b));
        if (children.length >= types.length) {
            return children;
        }
    }
    return null;
};


export default function parseEscrowData(condition) {
    const expiryCondition = filterByType({
        condition,
        typeId: TypeIds.timeout
    });

    const thresholdConditions = filterByType({
        condition,
        typeId: TypeIds.threshold
    });

    let executeCondition = null;
    let abortCondition = null;

    Object.values(thresholdConditions).forEach((thresholdCondition) => {
        if (!executeCondition) {
            const filteredExecuteCondition = filterChildrenByTypes({
                condition: thresholdCondition,
                types: [TypeIds.ed25519, TypeIds.timeout]
            });
            executeCondition = filteredExecuteCondition ?
                filterByType({
                    condition: thresholdCondition,
                    typeId: TypeIds.ed25519
                })[0] : null;
        }
        if (!abortCondition) {
            const filteredAbortCondition = filterChildrenByTypes({
                condition: thresholdCondition,
                types: [TypeIds.ed25519, TypeIds.inverter]
            });
            abortCondition = filteredAbortCondition ?
                filterByType({
                    condition: thresholdCondition,
                    typeId: TypeIds.ed25519
                })[0] : null;
        }
    });

    return {
        expiryTime: (expiryCondition.length > 0) ? expiryCondition[0].expire_time : null,
        executeCondition,
        abortCondition
    };
}

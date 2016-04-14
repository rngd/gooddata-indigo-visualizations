import { partial, includes, filter, first } from 'lodash';

function getFirstCategoryItem(categories, collections) {
    return first(
        filter(categories, category => includes(collections, category.category.collection))
    );
}

export function transformConfigToLine(config) {
    let getItem = partial(getFirstCategoryItem, config.buckets.categories),
        category = getItem(['attribute', 'view', 'trend']),
        stack = getItem(['stack', 'segment']);

    if (!stack) {
        return {
            type: config.type,
            x: category ? category.category.displayForm : '',
            y: '/metricValues',
            color: '/metricGroup',
            stacking: false,
            // TODO: do the following only matter for data
            where: {},
            orderBy: []
            // TODO: where to take colorPalette from?
        };
    }

    return {
        type: config.type,
        x: category ? category.category.displayForm : '',
        y: '/metricValues',
        color: stack.category.displayForm,
        stacking: config.type !== 'line',
        // TODO: do the following only matter for data
        where: {},
        orderBy: []
        // TODO: where to take colorPalette from?
    };
}
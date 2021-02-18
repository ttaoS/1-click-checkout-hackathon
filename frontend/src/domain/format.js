export const SUPPORT_CONTACT = 'placeholder@email';
export const LOCALE = 'en-AU';

export const round = (value, fractionalDigits = 2) => {
    // src: https://stackoverflow.com/a/41716722
    if (!Number.isFinite(value)) return value;
    const scale = Math.pow(10, fractionalDigits);
    return Math.round((value + Number.EPSILON) * scale) / scale;
};

export const toPunctuatedNumber = (val) => {
    return Number.isFinite(val) ? val.toLocaleString(LOCALE, {
        'minimumFractionDigits': 0,
        'maximumFractionDigits': 2,
    }) : val;
};

export const toCurrency = (val, {fraction} = {fraction: 2}) => {
    // en-AU => $.
    // undefined (default browser locale?) => A$
    // en-US => A$
    return Number.isFinite(val) ? val.toLocaleString(LOCALE, {
        'style': 'currency',
        'currency': 'AUD',
        'currencyDisplay': 'symbol',
        'minimumFractionDigits': fraction,
        'maximumFractionDigits': fraction,
    }) : val;
};
export const DISPLAY_DATE_AS_01_Jan_1970 = 'dd MMM yyyy';
export const WEATHER_GRAPH_DATE_FORMAT = 'dd MMMM';
export const API_DATE_FORMAT = 'yyyy-MM-dd';
export const REDUX_ID_FORMAT = 'yyyyMMdd';

export const classes = (...classList) => {
    return classList
        .filter(classItem => {
            if (typeof classItem === 'string') {
                return true;
            }
            if (Array.isArray(classItem)) {
                const [name, condition] = classItem;
                return typeof name === 'string' && condition;
            }
            return false;
        })
        .map(classItem => {
            if (typeof classItem === 'string') {
                return classItem;
            }
            return classItem[0];
        })
        .join(' ');
};
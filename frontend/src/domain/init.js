import isEmpty from 'lodash/isEmpty';

export const queryStringToQueryObject = (qs) => {
    if (isEmpty(qs)) return {};

    const obj = new URLSearchParams(qs);

    let draftInstrument = {};
    let farmRegion = {};
    let farmLocation = {};
    let rest = {};

    const algo = {
        _id: v => draftInstrument._id = v,

        risk: v => draftInstrument.risk = v,

        farmRegionLat: v => farmRegion.lat = Number(v),
        farmRegionLng: v => farmRegion.lng = Number(v),
        farmRegionAddress: v => farmRegion.address = v,

        farmLocationLat: v => farmLocation.lat = Number(v),
        farmLocationLng: v => farmLocation.lng = Number(v),
        farmLocationAddress: v => farmLocation.address = v,

        assetState: v => draftInstrument.assetState = v,


        startDate: v => draftInstrument.startDate = new Date(v),
        endDate: v => draftInstrument.endDate = new Date(v),
        threshold: v => draftInstrument.threshold = Number(v),

        payoutType: v => draftInstrument.payoutType = v,
        payoutFloor: v => draftInstrument.payoutFloor = Number(v),
        payoutAmount: v => draftInstrument.payoutAmount = Number(v),
        payoutCap: v => draftInstrument.payoutCap = Number(v),

        instrument: v => rest.instrument = v,
        instruments: v => rest.instruments = v.split(',').filter(val => !isEmpty(val)),

        code: v => rest.code = v,  // reset-password and verify-sign-up
        pre: v => rest.pre = v, // set after reset-password and verify-sign-up
        token: v => rest.token = v, // verify-sign-up

        redirectTo: v => rest.redirectTo = v,

        client: v => rest.client = v,
        broker: v => rest.broker = v,
    };

    obj.forEach((value, key) => {
        if (isEmpty(value)) return;
        algo[key](value);
    });

    let result = {};
    if (!isEmpty(draftInstrument)) {
        result.draftInstrument = draftInstrument;

        if (!isEmpty(farmRegion)) {
            result.draftInstrument.selectedFarmRegion = farmRegion;
        }

        if (!isEmpty(farmLocation)) {
            result.draftInstrument.selectedFarmLocation = farmLocation;
        }

    }

    if (!isEmpty(rest)) {
        result = {
            ...result,
            ...rest,
        };
    }

    return result;
};

export const queryObjectToQueryString = (params) => {
    if (isEmpty(params)) return '';

    const {draftInstrument, instruments, client, ...rest} = params;

    let di = {};
    if (!isEmpty(draftInstrument)) {
        const {
            _id,
            risk,
            selectedFarmRegion, selectedFarmLocation, assetState,
            selectedWeatherSource,
            startDate, endDate,
            threshold,
            payoutType, payoutFloor, payoutAmount, payoutCap,
        } = draftInstrument;

        di = {
            _id,
            ...(risk ? {risk} : {}),
            ...(selectedFarmRegion
                ? {
                    farmRegionLat: selectedFarmRegion.lat,
                    farmRegionLng: selectedFarmRegion.lng,
                    farmRegionAddress: selectedFarmRegion.address,
                } : {}),

            ...(selectedFarmLocation
                ? {
                    farmLocationLat: selectedFarmLocation.lat,
                    farmLocationLng: selectedFarmLocation.lng,
                    farmLocationAddress: selectedFarmLocation.address,
                } : {}),

            ...(assetState ? {assetState} : {}),

            ...(selectedWeatherSource
                ? {
                    weatherSourceId: selectedWeatherSource.id,
                    weatherSourceName: selectedWeatherSource.name,
                    weatherSourceType: selectedWeatherSource.type,
                    weatherSourceLat: selectedWeatherSource.location.lat,
                    weatherSourceLng: selectedWeatherSource.location.long,
                } : {}),

            ...(startDate ? {startDate: startDate.toISOString()} : {}),
            ...(endDate ? {endDate: endDate.toISOString()} : {}),
            ...(threshold ? {threshold} : {}),

            ...(payoutType ? {payoutType} : {}),
            ...(payoutFloor ? {payoutFloor} : {}),
            ...(payoutAmount ? {payoutAmount} : {}),
            ...(payoutCap ? {payoutCap} : {}),
        };
    }
    const result = {
        ...di,
        ...(client ? {client} : {}),
        ...(instruments ? {instruments} : {}),
        ...rest,
    };
    return decodeURIComponent(new URLSearchParams(result).toString());
};
import React from 'react';
import { renderIntoDocument } from 'react-addons-test-utils';
import { shallow } from 'enzyme';
import LineFamilyChartTransformation from '../LineFamilyChartTransformation';
import { data, config } from '../../test/fixtures';
import { RIGHT } from '../Legend/PositionTypes';
import HighChartRenderer from '../HighChartRenderer';

const SINGLE_SERIES_DATA = {
    isLoaded: true,
    isLoading: false,
    headers: [
        {
            id: 'm1',
            title: 'Metric',
            type: 'metric',
            uri: '/gdc/m1',
            format: '#,##0'
        },
        {
            id: 'date',
            title: 'Date',
            type: 'attrLabel',
            uri: '/gdc/date'
        }
    ],
    rawData: [
        [
            '2010',
            '1324'
        ]
    ]
};

const SINGLE_SERIES_CONFIG = {
    type: 'bar',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/m1',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'date',
                    collection: 'attribute',
                    displayForm: '/gdc/date',
                    dateFilterSettings: {
                        granularity: 'GDC.time.year'
                    }
                }
            }
        ]
    }
};

describe('LineFamilyChartTransformation', () => {
    const defaultProps = {
        onDataTooLarge: () => {},
        config,
        data
    };

    function createComponent(customProps = {}) {
        const props = { ...defaultProps, ...customProps };
        return <LineFamilyChartTransformation {...props} />;
    }

    it('should use custom renderer', () => {
        const lineFamilyChartRenderer = jest.fn().mockReturnValue(<div />);
        renderIntoDocument(createComponent({ lineFamilyChartRenderer }));
        expect(lineFamilyChartRenderer).toHaveBeenCalled();
    });

    describe('Legend config', () => {
        function createFamilyChartRendererProps(defaultData, defaultConfig, legendProps = {}) {
            const lineFamilyChartRenderer = jest.fn().mockReturnValue(<div />);
            renderIntoDocument(createComponent({
                lineFamilyChartRenderer,
                data: { ...defaultData },
                config: {
                    ...defaultConfig,
                    legend: {
                        ...legendProps
                    }
                }
            }));
            return lineFamilyChartRenderer.mock.calls[0][0];
        }

        it('should be always disabled for single series', () => {
            const passedProps = createFamilyChartRendererProps(SINGLE_SERIES_DATA, SINGLE_SERIES_CONFIG, {
                enabled: true
            });
            expect(passedProps.legend.enabled).toEqual(false);
        });

        it('should be enabled & on the right by default', () => {
            const passedProps = createFamilyChartRendererProps(data, config);
            expect(passedProps.legend.enabled).toEqual(true);
            expect(passedProps.legend.position).toEqual(RIGHT);
        });

        it('should be able to override defaults', () => {
            const passedProps = createFamilyChartRendererProps(data, config, {
                enabled: false
            });
            expect(passedProps.legend.enabled).toEqual(false);
        });
    });

    describe('onDataTooLarge', () => {
        it('should be invoked if data series is over limit', () => {
            const onDataTooLarge = jest.fn();
            const props = {
                onDataTooLarge,
                limits: {
                    series: 1
                }
            };
            renderIntoDocument(createComponent(props));
            expect(onDataTooLarge).toHaveBeenCalled();
        });

        it('should be invoked if data categories is over limit', () => {
            const onDataTooLarge = jest.fn();
            const props = {
                onDataTooLarge,
                limits: {
                    categories: 1
                }
            };
            renderIntoDocument(createComponent(props));
            expect(onDataTooLarge).toHaveBeenCalled();
        });

        it('should be invoked on component mount', () => {
            const onDataTooLarge = jest.fn();
            const props = {
                onDataTooLarge,
                limits: {
                    series: 1
                }
            };
            const wrapper = shallow(createComponent(props));
            expect(wrapper.find(HighChartRenderer)).toHaveLength(0);
            expect(onDataTooLarge).toHaveBeenCalled();
        });

        it('should be invoked on props change', () => {
            const onDataTooLarge = jest.fn();
            const props = {
                onDataTooLarge,
                limits: {
                    series: 1
                }
            };
            const wrapper = shallow(createComponent());
            expect(wrapper.find(HighChartRenderer)).toHaveLength(1);

            wrapper.setProps(props);
            expect(wrapper.find(HighChartRenderer)).toHaveLength(0);
            expect(onDataTooLarge).toHaveBeenCalled();

            wrapper.setProps({
                ...defaultProps,
                limits: null
            });
            expect(wrapper.find(HighChartRenderer)).toHaveLength(1);
        });
    });
});
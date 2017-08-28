/**
 * (c) 2010-2017 Kacper Madej
 *
 * License: www.highcharts.com/license
 */

'use strict';
import H from '../parts/Globals.js';
import '../parts/Utilities.js';

var each = H.each,
	pick = H.pick,
	isNumber = H.isNumber,
	relativeLength = H.relativeLength,
	seriesType = H.seriesType,
	columnProto = H.seriesTypes.column.prototype;

/**
 * The bullet series type.
 *
 * @constructor seriesTypes.bullet
 * @augments seriesTypes.column
 */
seriesType('bullet', 'column',
	/**
	 * A bullet graph is a variation of a bar graph. The bullet graph features
	 * a single measure, compares it to a target, and displays it in the context
	 * of qualitative ranges of performance that could be set using
	 * [plotBands](#yAxis.plotBands) on [yAxis](#yAxis).
	 * 
	 * @extends {plotOptions.column}
	 * @product highcharts
	 * @sample {highcharts} highcharts/demo/bullet/ Bullet graph
	 * @since 6.0.0
	 * @excluding allAreas,boostThreshold,colorAxis,compare,compareBase
	 * @optionparent plotOptions.bullet
	 */
	{
		/**
		 * The width of the rectangle representing the target. Could be set as
		 * a pixel value or as a percentage of a column width.
		 * 
		 * @type {Number|String}
		 * @since 6.0.0
		 * @default '140%'
		 * @product highcharts
		 */
		targetWidth: '140%',

		/**
		 * The height of the rectangle representing the target.
		 * 
		 * @type {Number}
		 * @since 6.0.0
		 * @default 3
		 * @product highcharts
		 */
		targetHeight: 3,

		/*= if (build.classic) { =*/
		/**
		 * The border width of the rectangle representing the target.
		 *
		 * In styled mode, use class 'highcharts-bullet-target' instead.
		 * 
		 * @type {Number}
		 * @since 6.0.0
		 * @default 0
		 * @product highcharts
		 */
		targetBorderWidth: 0,

		/**
		 * The border color of the rectangle representing the target. When
		 * not set, the  point's border color is used.
		 *
		 * In styled mode, use class `highcharts-bullet-target` instead.
		 * 
		 * @type {Color}
		 * @since 6.0.0
		 * @product highcharts
		 * @apioption plotOptions.bullet.targetBorderColor
		 */

		/**
		 * The color of the rectangle representing the target. When not set,
		 * point's color (if set in point's options -
		 * [`color`](#series.bullet.data.color)) or zone of the target value
		 * (if [`zones`](#plotOptions.bullet.zones) or
		 * [`negativeColor`](#plotOptions.bullet.negativeColor) are set)
		 * or the same color as the point has is used.
		 *
		 * In styled mode, use class `highcharts-bullet-target` instead.
		 * 
		 * @type {Color}
		 * @since 6.0.0
		 * @product highcharts
		 * @apioption plotOptions.bullet.targetColor
		 */
		/*= } =*/

		tooltip: {
			/**
			 * The HTML of the point's line in the tooltip. Variables are
			 * enclosed by curly brackets. Available variables are `point.x`,
			 * `point.y`, `point.change`, `series.name` and `series.color`
			 * and other properties on the same form. Furthermore, `point.y`
			 * can be extended by the
			 * [`tooltip.valuePrefix`](#tooltip.valuePrefix) and
			 * [`tooltip.valueSuffix`](#tooltip.valueSuffix) variables.
			 * 
			 * In styled mode, defaults to `'<span
			 * class="highcharts-color-{point.colorIndex}">\u25CF</span>
			 * {series.name}: <span class="highcharts-strong">{point.y}</span>.
			 * Target: <span class="highcharts-strong">{point.target}
			 * </span><br/>'`.
			 * 
			 * @type {Number}
			 * @since 6.0.0
			 * @default '<span style="color:{series.color}">\u25CF</span>
			 * {series.name}: <b>{point.y}</b>.
			 * Target: <b>{point.target}</b><br/>'
			 * @product highcharts
			 * @apioption plotOptions.bullet.tooltip.pointFormat
			 */
			/*= if (build.classic) { =*/
			pointFormat: '<span style="color:{series.color}">\u25CF</span>' +
				' {series.name}: <b>{point.y}</b>.' +
				' Target: <b>{point.target}</b><br/>',
			/*= } else { =*/

			pointFormat: '' + // eslint-disable-line no-dupe-keys
				'<span class="highcharts-color-{point.colorIndex}">' +
				'\u25CF</span> {series.name}: ' +
				'<span class="highcharts-strong">{point.y}</span>. ' +
				'Target: <span class="highcharts-strong">' +
				'{point.target}</span><br/>'
			/*= } =*/
		}
	}, {
		pointArrayMap: ['y', 'target'],
		parallelArrays: ['x', 'y', 'target'],

		/**
		 * Draws the targets. For inverted chart, the `series.group` is rotated,
		 * so the same coordinates apply. This method is based on
		 * column series drawPoints function.
		 */
		drawPoints: function () {
			var series = this,
				chart = series.chart,
				options = series.options,
				animationLimit = options.animationLimit || 250;

			columnProto.drawPoints.apply(this);

			each(series.points, function (point) {
				var borderWidth,
					height,
					pointOptions = point.options,
					shapeArgs,
					targetGraphic = point.targetGraphic,
					targetShapeArgs,
					targetVal = point.target,
					pointVal = point.y,
					width,
					y;

				if (isNumber(targetVal) && targetVal !== null) {
					borderWidth = pick(
						pointOptions.targetBorderWidth,
						options.targetBorderWidth
					);
					height = pick(
						pointOptions.targetHeight,
						options.targetHeight
					);
					shapeArgs = point.shapeArgs;
					width = relativeLength(
						pick(pointOptions.targetWidth, options.targetWidth),
						shapeArgs.width
					);
					y = series.yAxis.translate(
							targetVal,
							false,
							true,
							false,
							true
						) - height / 2 - 0.5;

					targetShapeArgs = series.crispCol.apply({
						// Use fake series object to set borderWidth of target
						chart: chart,
						borderWidth: borderWidth,
						options: {
							crisp: options.crisp
						}
					}, [
						shapeArgs.x + shapeArgs.width / 2 - width / 2,
						y,
						width,
						height
					]);

					if (targetGraphic) {
						// Update
						targetGraphic[
							chart.pointCount < animationLimit ?
								'animate' :
								'attr'
						](targetShapeArgs);

						// Add or remove tooltip reference
						if (isNumber(pointVal) && pointVal !== null) {
							targetGraphic.element.point = point;
						} else {
							targetGraphic.element.point = undefined;
						}
					} else {
						point.targetGraphic = targetGraphic = chart.renderer
							.rect()
							.attr(targetShapeArgs)
							.add(series.group);
					}
					/*= if (build.classic) { =*/
					// Presentational              
					targetGraphic.attr({
						fill: pick(
							pointOptions.targetColor,
							options.targetColor,
							pointOptions.color,
							(series.zones.length && (point.getZone.call({
								series: series,
								x: point.x,
								y: targetVal,
								options: {}
							}).color || series.color)) || undefined,
							point.color,
							series.color
						),
						stroke: pick(
							pointOptions.targetBorderColor,
							options.targetBorderColor,
							point.borderColor,
							series.options.borderColor
						),
						'stroke-width': borderWidth
					});
					/*= } =*/

					// Add tooltip reference
					if (isNumber(pointVal) && pointVal !== null) {
						targetGraphic.element.point = point;
					}

					targetGraphic.addClass(point.getClassName() +
						' highcharts-bullet-target', true);
				} else if (targetGraphic) {
					point.targetGraphic = targetGraphic.destroy(); // #1269
				}
			});
		},

		/**
		 * Includes target values to extend extremes from y values.
		 */
		getExtremes: function (yData) {
			var series = this,
				targetData = series.targetData,
				yMax,
				yMin;

			columnProto.getExtremes.call(this, yData);

			if (targetData && targetData.length) {
				yMax = series.dataMax;
				yMin = series.dataMin;
				columnProto.getExtremes.call(this, targetData);
				series.dataMax = Math.max(series.dataMax, yMax);
				series.dataMin = Math.min(series.dataMin, yMin);
			}
		}
	}, /** @lends seriesTypes.ohlc.prototype.pointClass.prototype */ {
		/**
		 * Destroys target graphic.
		 */
		destroy: function () {
			if (this.targetGraphic) {
				this.targetGraphic = this.targetGraphic.destroy();
			}
			columnProto.pointClass.prototype.destroy.apply(this, arguments);
		}
	});


/**
 * A `bullet` series. If the [type](#series.bullet.type) option is not
 * specified, it is inherited from [chart.type](#chart.type).
 * 
 * For options that apply to multiple series, it is recommended to add
 * them to the [plotOptions.series](#plotOptions.series) options structure.
 * To apply to all series of this specific type, apply it to [plotOptions.
 * bullet](#plotOptions.bullet).
 * 
 * @type {Object}
 * @since 6.0.0
 * @extends series,plotOptions.bullet
 * @excluding dataParser,dataURL
 * @product highcharts
 * @apioption series.bullet
 */

/**
 * An array of data points for the series. For the `bullet` series type,
 * points can be given in the following ways:
 * 
 * 1.  An array of arrays with 3 or 2 values. In this case, the values
 * correspond to `x,y,target`. If the first value is a string,
 * it is applied as the name of the point, and the `x` value is inferred.
 * The `x` value can also be omitted, in which case the inner arrays
 * should be of length 2\. Then the `x` value is automatically calculated,
 * either starting at 0 and incremented by 1, or from `pointStart`
 * and `pointInterval` given in the series options.
 * 
 *  ```js
 *     data: [
 *         [0, 40, 75],
 *         [1, 50, 50],
 *         [2, 60, 40]
 *     ]
 *  ```
 * 
 * 2.  An array of objects with named values. The objects are point
 * configuration objects as seen below. If the total number of data
 * points exceeds the series' [turboThreshold](#series.bullet.turboThreshold),
 * this option is not available.
 * 
 *  ```js
 *     data: [{
 *         x: 0,
 *         y: 40,
 *         target: 75,
 *         name: "Point1",
 *         color: "#00FF00"
 *     }, {
 *         x: 1,
 *         y: 60,
 *         target: 40,
 *         name: "Point2",
 *         color: "#FF00FF"
 *     }]
 *  ```
 * 
 * @type {Array<Object|Array>}
 * @since 6.0.0
 * @extends series.column.data
 * @product highcharts
 * @apioption series.bullet.data
 */

/**
 * The target value of a point.
 * 
 * @type {Number}
 * @since 6.0.0
 * @product highcharts
 * @apioption series.bullet.data.target
 */

/**
 * Individual width of the rectangle representing the target for a point.
 * Could be set as a pixel value or as a percentage of a column width.
 * 
 * @type {Number|String}
 * @since 6.0.0
 * @default '140%'
 * @product highcharts
 * @apioption series.bullet.data.targetWidth
 */

/**
 * Individual height of the rectangle representing the target for a point.
 * 
 * @type {Number}
 * @since 6.0.0
 * @default 3
 * @product highcharts
 * @apioption series.bullet.data.targetHeight
 */

/*= if (build.classic) { =*/
/**
 * Individual border width of the rectangle representing the target for
 * a point.
 *
 * In styled mode, use class 'highcharts-bullet-target' instead.
 * 
 * @type {Number}
 * @since 6.0.0
 * @default 0
 * @product highcharts
 * @apioption series.bullet.data.targetBorderWidth
 */

/**
 * Individual border color of the rectangle representing the target for
 * a point. When not set, color of point's border color is used.
 *
 * In styled mode, use class 'highcharts-bullet-target' instead.
 * 
 * @type {Color}
 * @since 6.0.0
 * @product highcharts
 * @apioption series.bullet.data.targetBorderColor
 */

/**
 * Individual color of the rectangle representing the target for a point.
 * When not set, point's color (if set in point's options -
 * [`color`](#series.bullet.data.color)) or zone of the target value
 * (if [`zones`](#plotOptions.bullet.zones) or
 * [`negativeColor`](#plotOptions.bullet.negativeColor) are set)
 * or the same color as the point has is used.
 *
 * In styled mode, use class 'highcharts-bullet-target' instead.
 * 
 * @type {Color}
 * @since 6.0.0
 * @product highcharts
 * @apioption series.bullet.data.targetColor
 */
/*= } =*/

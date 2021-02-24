import { Component, ComponentInterface, Host, Prop, h } from '@stencil/core';

import { config } from '../../global/config';
import { getIonMode } from '../../global/ionic-global';
import { Color } from '../../interface';
import { clamp } from '../../utils/helpers';
import { createColorClasses } from '../../utils/theme';

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @part progress - The progress bar that shows the current value (determinate) or slides back and forth (indeterminate).
 * @part circles - The circles that animate while buffering, only shows when buffer is set.
 * @part buffer - The buffer bar used to show additional progress while buffering.
 */
@Component({
  tag: 'ion-progress-bar',
  styleUrls: {
    ios: 'progress-bar.ios.scss',
    md: 'progress-bar.md.scss'
  },
  shadow: true
})
export class ProgressBar implements ComponentInterface {

  /**
   * The state of the progress bar, based on if the time the process takes is known or not.
   * Default options are: `"determinate"` (no animation), `"indeterminate"` (animate from left to right).
   */
  @Prop() type: 'determinate' | 'indeterminate' = 'determinate';

  /**
   * If true, reverse the progress bar direction.
   */
  @Prop() reversed = false;

  /**
   * The value determines how much of the active bar should display when the
   * `type` is `"determinate"`.
   * The value should be between [0, 1].
   */
  @Prop() value = 0;

  /**
   * If the buffer and value are smaller than 1, the buffer circles will show.
   * The buffer should be between [0, 1].
   */
  @Prop() buffer = 1;

  /**
   * The color to use from your application's color palette.
   * Default options are: `"primary"`, `"secondary"`, `"tertiary"`, `"success"`, `"warning"`, `"danger"`, `"light"`, `"medium"`, and `"dark"`.
   * For more information on colors, see [theming](/docs/theming/basics).
   */
  @Prop() color?: Color;

  render() {
    const { color, type, reversed, value, buffer } = this;
    const paused = config.getBoolean('_testing');
    const mode = getIonMode(this);
    return (
      <Host
        role="progressbar"
        aria-valuenow={type === 'determinate' ? value : null}
        aria-valuemin="0"
        aria-valuemax="1"
        class={createColorClasses(color, {
          [mode]: true,
          [`progress-bar-${type}`]: true,
          'progress-paused': paused,
          'progress-bar-reversed': document.dir === 'rtl' ? !reversed : reversed
        })}
      >
        {type === 'indeterminate'
          ? renderIndeterminate()
          : renderProgress(value, buffer)
        }
      </Host>
    );
  }
}

const renderIndeterminate = () => {
  return [
    <div part="progress" class="indeterminate-bar-primary"><span class="progress-indeterminate"></span></div>,
    <div part="progress" class="indeterminate-bar-secondary"><span class="progress-indeterminate"></span></div>
  ];
};

const renderProgress = (value: number, buffer: number) => {
  const finalValue = clamp(0, value, 1);
  const finalBuffer = clamp(0, buffer, 1);

  return [
    <div part="progress" class="progress" style={{ transform: `scaleX(${finalValue})` }}></div>,
    /**
     * Buffer circles with two container to move
     * the circles behind the buffer progress
     * with respecting the animation.
     * When finalBuffer === 1, we use display: none
     * instead of removing the element to avoid flickering.
     */
    <div class={{ 'buffer-circles-container': true, 'ion-hide': finalBuffer === 1 }} style={{ transform: `translateX(${finalBuffer * 100}%)` }}>
      <div class="buffer-circles-container" style={{ transform: `translateX(-${finalBuffer * 100}%)` }}>
        <div part="circles" class="buffer-circles"></div>
      </div>
    </div>,
    <div part="buffer" class="progress-buffer-bar" style={{ transform: `scaleX(${finalBuffer})` }}></div>,
  ];
};

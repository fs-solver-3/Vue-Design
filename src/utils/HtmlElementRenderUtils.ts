import { JobStatus } from '@core/DataIngestion';
import { ListUtils } from '@/utils/list.utils';

export class HtmlElementRenderUtils {
  static buildButton(title: string, imgSrc: string, onClick: () => void): HTMLElement {
    const container = document.createElement('div');
    const buttonImage = document.createElement('img');
    const buttonTitle = document.createElement('div');
    buttonTitle.innerHTML = title;
    buttonImage.src = require(`@/assets/icon/${imgSrc}`);
    container.style.display = 'flex';
    buttonImage.style.marginRight = '8px';
    container.style.padding = '8px';
    container.classList.add('btn-ghost');
    container.append(buttonImage);
    container.append(buttonTitle);
    container.addEventListener('click', onClick);
    return container;
  }

  static renderAction(buttons: HTMLElement[]): HTMLElement {
    const container = document.createElement('div');
    container.style.display = 'flex';
    buttons.forEach((button, index) => {
      container.append(button);
      if (index !== 0) {
        button.style.marginLeft = '32px';
      }
    });
    return container;
  }

  static buildTextColor(text: string, color: string): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('text-truncate');
    container.innerHTML = text;
    container.style.color = color;
    return container;
  }

  /**
   * Render textHtml to html as a string
   * @param textHtml
   */
  static renderDivAsString(textHtml: string, classHtml = ''): string {
    return `<div class="${classHtml}">${textHtml}</div>`;
  }

  static renderImgAsString(iconSource: string, classHtml = ''): string {
    const img = document.createElement('img');
    img.src = iconSource;
    img.alt = '';
    if (classHtml) {
      img.classList.add(...classHtml.split(' '));
    }
    return img.outerHTML;
  }
}

import { Injectable } from '@angular/core';
import JSZip from 'jszip';

interface SlideElement {
  type: 'text' | 'image' | 'shape';
  content: string;
  style: any;
  position: { x: number; y: number; width: number; height: number };
}

interface SlideContent {
  elements: SlideElement[];
}

@Injectable({
  providedIn: 'root'
})
export class PptxService {
  async extractFromPptx(file: File): Promise<SlideContent[]> {
    const zip = await JSZip.loadAsync(file);
    const slideContents: SlideContent[] = [];

    const slideFiles = Object.keys(zip.files).filter(name =>
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    );

    for (const slideFile of slideFiles) {
      const content = await zip.file(slideFile)?.async('string');
      if (content) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        const elements = this.parseSlideElements(xmlDoc, zip);
        slideContents.push({ elements });
      }
    }

    return slideContents;
  }

  private parseSlideElements(xmlDoc: Document, zip: JSZip): SlideElement[] {
    const elements: SlideElement[] = [];

    // Parse text boxes
    const txBodyElements = xmlDoc.getElementsByTagName('p:txBody');
    for (const txBody of Array.from(txBodyElements)) {
      elements.push(this.parseTextElement(txBody));
    }

    // Parse shapes
    const spElements = xmlDoc.getElementsByTagName('p:sp');
    for (const sp of Array.from(spElements)) {
      elements.push(this.parseShapeElement(sp));
    }

    // Parse images
    const picElements = xmlDoc.getElementsByTagName('p:pic');
    for (const pic of Array.from(picElements)) {
      elements.push(this.parseImageElement(pic, zip));
    }

    return elements;
  }

  private parseTextElement(element: Element): SlideElement {
    // Extract text, style, and position
    // This is a simplified version and would need to be expanded
    const text = element.textContent || '';
    return {
      type: 'text',
      content: text,
      style: {}, // Extract font, color, size, etc.
      position: this.extractPosition(element.parentElement)
    };
  }

  private parseShapeElement(element: Element): SlideElement {
    // Extract shape type, style, and position
    return {
      type: 'shape',
      content: element.getAttribute('shape-type') || 'rect',
      style: {}, // Extract fill color, line style, etc.
      position: this.extractPosition(element)
    };
  }

  private parseImageElement(element: Element, zip: JSZip): SlideElement {
    // Extract image data, style, and position
    return {
      type: 'image',
      content: '', // Extract image data and convert to base64
      style: {},
      position: this.extractPosition(element)
    };
  }

  private extractPosition(element: Element | null): { x: number; y: number; width: number; height: number } {
    // Extract position and size from the element
    // This is a placeholder and would need to be implemented
    return { x: 0, y: 0, width: 0, height: 0 };
  }
}

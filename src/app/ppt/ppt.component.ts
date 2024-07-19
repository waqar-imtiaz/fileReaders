import { Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as XLSX from 'xlsx';
import { PptxService } from '../../services/pptx.service';
import { CommonModule } from '@angular/common';


interface SlideElement {
  type: 'text' | 'image' | 'shape';
  content: string;
  style: any;
  position: { x: number; y: number; width: number; height: number };
}

interface SlideContent {
  elements: SlideElement[];
}

@Component({
  selector: 'app-ppt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ppt.component.html',
  styleUrl: './ppt.component.scss'
})
export class PptComponent {

  constructor(private sanitizer: DomSanitizer,
    private pptxService: PptxService
  ){}

  htmlData: SafeHtml = '<h2>Hello file</h2>';
  slides: SlideContent[] = [];
  loading = false;

  onFileChange(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Process the workbook
      this.renderPpt(workbook);
    };

    reader.readAsArrayBuffer(file);
  }

  renderPpt(workbook: XLSX.WorkBook) {
    // This is a simplified example. You'll need to implement
    // the actual rendering logic based on the PPT structure.
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const htmlString = XLSX.utils.sheet_to_html(firstSheet);

    // Insert the HTML into your component's view
    // document.getElementById('ppt-container').innerHTML = htmlString;
    this.htmlData = this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }



  async handleFileInput(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.loading = true;
      try {
        this.slides = await this.pptxService.extractFromPptx(file);
        console.log('Extracted slide content:', this.slides);
      } catch (error) {
        console.error('Error extracting PPTX content:', error);
      } finally {
        this.loading = false;
      }
    }
  }

}

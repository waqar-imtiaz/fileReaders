import { Component, ViewChild, TemplateRef } from '@angular/core';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';



@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  files: any[] = [];
  selectedFile: any;
  @ViewChild('filePreview') dialogTemplate!: TemplateRef<any>;
  dialogRef!: MatDialogRef<any> | null;
  chartData!: ChartData;
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  constructor(public dialog: MatDialog) {}

  onFileSelected(event: any) {
    const selectedFiles = event.target.files;
    for (let file of selectedFiles) {
      console.log(file);
      if (file.type === 'text/csv' || file.type ==='application/vnd.ms-excel') {
        this.readCsvFile(file);
      } else if(file.type === 'text/tab-separated-values' || this.isTsvFile(file.name)) {
        this.readTsvFile(file);

      } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        this.readPptxFile(file);
      }else {
        this.readFileAsDataURL(file);
      }
    }
  }

  readPptxFile(file: any) {
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const content = e.target.result;
      const thumbnail = await this.createPptxThumbnail(file);
      this.files.push({ file, thumbnail, content, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', name: file.name, url: content });
    };
    reader.readAsArrayBuffer(file);
  }

  isTsvFile(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.tsv');
  }

  readTsvFile(file: any) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const content = e.target.result;
      const thumbnail = this.createTsvThumbnail(content);
      
      this.files.push({ file, thumbnail, content, type: (file.type !== '' ? file.type : 'text/tab-separated-values'), name: file.name, url: content });
    };
    reader.readAsText(file);
  }

  createTsvThumbnail(content: string): string {
    const parsed:any = Papa.parse(content, {
      delimiter: '\t',
      header: true,
    });

    // Construct a simple HTML preview of the TSV content
    let preview = '<table class="table">';
    if (parsed.data.length > 0) {
      preview += '<thead><tr>';
      for (let header of Object.keys(parsed.data[0])) {
        preview += `<th>${header}</th>`;
      }
      preview += '</tr></thead><tbody>';
      for (let row of parsed.data) {
        preview += '<tr>';
        for (let cell of Object.values(row)) {
          preview += `<td>${cell}</td>`;
        }
        preview += '</tr>';
      }
      preview += '</tbody>';
    }
    preview += '</table>';

    return preview;
  }

  readCsvFile(file: any) {
    console.log(file);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const content = e.target.result;
      const thumbnail = this.createCsvThumbnail(content);
      this.files.push({ file, thumbnail, content, type: file.type, name: file.name, url: content });
    };
    reader.readAsText(file);
    console.log(reader);
  }

  readFileAsDataURL(file: any) {
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      let thumbnail = e.target.result;
      let content = e.target.result;
      if (file.type.startsWith('image/')) {
        // Directly use the image as thumbnail
      } else if (file.type === 'text/plain') {
        thumbnail = this.createTextThumbnail(e.target.result);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        thumbnail = this.createExcelThumbnail(e.target.result);
      }
      // Add more types as needed

      this.files.push({ file, thumbnail, content, type: file.type, name: file.name, url: e.target.result });
    };
    reader.readAsArrayBuffer(file);
  }

  createTextThumbnail(content: string): string {
    return content.substring(0, 100) + '...'; // Simple text preview
  }

  // createExcelThumbnail(content: any): string {
  //   const data = new Uint8Array(content);
  //   const workbook = XLSX.read(data, { type: 'array' });
  //   const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  //   const preview = XLSX.utils.sheet_to_html(firstSheet);
  //   return preview;
  // }

  createExcelThumbnail(content: any): string {
    const data = new Uint8Array(content);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const preview = XLSX.utils.sheet_to_html(firstSheet);

    // Check for chart data and extract it
    const chartData = this.extractChartData(workbook);

    // Render the chart if chart data is found
    if (chartData) {
      this.chartData = chartData;
    }

    return preview;
  }

  extractChartData(workbook: any): any {
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const labels: string[] = [];
    const data: number[] = [];

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
        if (R === 0) {
          labels.push(cell ? cell.v : '');
        } else {
          data.push(cell ? cell.v : 0);
        }
      }
    }

    if (labels.length && data.length) {
      return {
        labels,
        datasets: [
          {
            label: 'Sample Data',
            data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      };
    }

    return null;
  }

  createCsvThumbnail(content: any): string {
    const parsed = Papa.parse(content, { header: true });
    if (parsed.data.length > 0) {
      return JSON.stringify(parsed.data.slice(0, 5), null, 2); // Simple JSON preview of the first 5 rows
    }
    return 'Empty or invalid CSV file';
  }

  async createPptxThumbnail(file: Blob): Promise<string> {
    const zip = new JSZip();
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
        reader.onload = async (e: any) => {
            try {
                const content = await zip.loadAsync(e.target.result);
                const slides = content.folder('ppt/slides');
                let slidePreviews: string[] = [];

                if (slides) {
                    const slideFiles = Object.keys(slides.files).filter(f => f.endsWith('.xml'));
                    for (const slideFile of slideFiles) {
                        const slideContent = content.file(slideFile);
                        if (slideContent) {
                            const slide = await slideContent.async('string');
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(slide, 'application/xml');
                            const slideHtml = await this.convertSlideToHtml(xmlDoc, content);
                            slidePreviews.push(slideHtml);
                        }
                    }
                    resolve(slidePreviews.join('<hr>')); // Combine slide previews with a separator
                } else {
                    console.error('Slides folder not found in PPTX');
                    resolve(''); // Return empty string if slides folder is not found
                }
            } catch (error) {
                console.error('Error processing PPTX file:', error);
                reject('');
            }
        };
        reader.readAsArrayBuffer(file);
    });
  }



openPreview(file: any) {
    this.selectedFile = file;
    if (!this.dialogRef) {
        this.dialogRef = this.dialog.open(this.dialogTemplate, {
            width: '90vw',
            height: '90vh',
        });
        this.dialogRef.afterClosed().subscribe(() => {
            this.dialogRef = null;
        });
    }

    // Special handling for TSV files and PPTX files in enlarge view
    if (file.type === 'text/tab-separated-values') {
        const content = file.content;
        this.selectedFile.enlargedPreview = this.createEnlargedTsvPreview(content);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        this.selectedFile.enlargedPreview = this.createEnlargedPptxPreview(file);
    }
}

async createEnlargedPptxPreview(file: Blob): Promise<void> {
  const zip = new JSZip();
  const reader = new FileReader();
  reader.onload = async (e: any) => {
      try {
          const content = await zip.loadAsync(e.target.result);
          const slides = content.folder("ppt/slides");
          let slideContents: string[] = [];

          if (slides) {
              const slideFiles = Object.keys(slides.files).filter(f => f.endsWith('.xml'));
              for (const slideFile of slideFiles) {
                  const slideContent = content.file(slideFile);
                  if (slideContent) {
                      const slide = await slideContent.async("string");
                      const parser = new DOMParser();
                      const xmlDoc = parser.parseFromString(slide, "application/xml");
                      const slideHtml = await this.convertSlideToHtml(xmlDoc, content);
                      slideContents.push(slideHtml);
                  }
              }
              this.selectedFile.enlargedPreview = slideContents.join("<hr>"); // Combine slide previews with a separator
          } else {
              console.error("Slides folder not found in PPTX");
              this.selectedFile.enlargedPreview = ''; // Return empty string if slides folder is not found
          }
      } catch (error) {
          console.error("Error processing PPTX file:", error);
          this.selectedFile.enlargedPreview = '';
      }
  };
  reader.readAsArrayBuffer(file);
}


async convertSlideToHtml(xmlDoc: Document, content: any): Promise<string> {
  const texts = Array.from(xmlDoc.getElementsByTagName("a:t")).map(node => node.textContent).join(" ");
  const images = await this.extractImages(xmlDoc, content);
  return `<div class="slide">${texts} ${images}</div>`;
}

async extractImages(xmlDoc: Document, content: any): Promise<string> {
  const imageNodes = Array.from(xmlDoc.getElementsByTagName('a:blip'));
  let imagesHtml: string[] = [];

  for (const imageNode of imageNodes) {
      const embedAttr = imageNode.getAttribute('r:embed');
      if (embedAttr) {
          const relsPath = 'ppt/slides/_rels/' + embedAttr + '.rels';
          const relsFile = content.file(relsPath);
          if (relsFile) {
              const relsContent = await relsFile.async('string');
              const relsDoc = new DOMParser().parseFromString(relsContent, 'application/xml');
              const targetNode = relsDoc.querySelector(`Relationship[Id="${embedAttr}"]`);
              if (targetNode) {
                  const target:any = targetNode.getAttribute('Target');
                  const imagePath = 'ppt/media/' + target.split('/').pop();
                  const imageFile = content.file(imagePath);
                  if (imageFile) {
                      const imageData = await imageFile.async('base64');
                      imagesHtml.push(`<img src="data:image/png;base64,${imageData}" alt="Slide Image">`);
                  }
              }
          }
      }
  }

  return imagesHtml.join(' ');
}

getImagePath(content: any, embedAttr: string): string {
  const rels = content.file("ppt/_rels/presentation.xml.rels");
  if (rels) {
      const relsContent = rels.async("string");
      const parser = new DOMParser();
      const relsDoc = parser.parseFromString(relsContent, "application/xml");
      const imageRel = relsDoc.querySelector(`Relationship[Id='${embedAttr}']`);
      if (imageRel) {
          return `ppt/${imageRel.getAttribute("Target")}`;
      }
  }
  return '';
}

createEnlargedTsvPreview(content: string): string {
 return this.createTsvThumbnail(content);
}



  closeDialog() {
    console.log(this.dialogRef);
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}

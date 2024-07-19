import { Component } from '@angular/core';
import { BiologicParserService } from '../../services/bio.service';

@Component({
  selector: 'app-bio-files',
  standalone: true,
  imports: [],
  templateUrl: './bio-files.component.html',
  styleUrl: './bio-files.component.scss'
})
export class BioFilesComponent {

  constructor(private biologicParserService: BiologicParserService) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    const fileType = file.name.split('.').pop();

    if (fileType === 'mpr') {
      this.biologicParserService.parseMprFile(file);
    }
  }

}

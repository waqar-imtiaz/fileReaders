import { Routes } from '@angular/router';
import { PptComponent } from './ppt/ppt.component';
import { PptxToHtmlComponent } from './pptx-to-html/pptx-to-html.component';
import { BioFilesComponent } from './bio-files/bio-files.component';

export const routes: Routes = [
    {
        component: PptComponent,
        path: 'ppt'
    },
    { component: PptxToHtmlComponent, path: 'pptx' },
    { component: BioFilesComponent, path: 'bio' }
];

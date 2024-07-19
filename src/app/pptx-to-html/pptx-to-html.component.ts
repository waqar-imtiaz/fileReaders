import { Component } from '@angular/core';

declare var $: any; // Declare jQuery

@Component({
  selector: 'app-pptx-to-html',
  standalone: true,
  imports: [],
  templateUrl: './pptx-to-html.component.html',
  styleUrl: './pptx-to-html.component.scss'
})
export class PptxToHtmlComponent {

  ngOnInit(): void {
    console.log('this iws wirkk');
    console.log($);
    console.log($.pptxToHtml)
    this.initializePptxToHtml();
  }

  initializePptxToHtml(): void {

    $('#your_div_id_result').pptxToHtml({
      // pptxFileUrl: "path/to/your_pptx_file.pptx",
      fileInputId: "upload_pptx_file",
      slidesScale: "",
      slideMode: false,
      keyBoardShortCut: false,
      mediaProcess: true,
      jsZipV2: "./js/jszip.min.js",
      themeProcess: true,
      incSlide: { height: 2, width: 2 },
      slideType: "divs2slidesjs",
      slideModeConfig: {
        first: 1,
        nav: false,
        navTxtColor: "white",
        showPlayPauseBtn: false,
        keyBoardShortCut: false,
        showSlideNum: false,
        showTotalSlideNum: false,
        autoSlide: false,
        randomAutoSlide: false,
        loop: false,
        background: "black",
        transition: "default",
        transitionTime: 1
      },
      revealjsConfig: {
        transition: 'zoom',
        slideNumber: true
      }
    });
  }


}

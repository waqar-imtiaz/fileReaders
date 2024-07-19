
import Plotly from 'plotly.js-dist-min'
import { Injectable } from '@angular/core';
import { parseMPR } from 'biologic-converter';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class BiologicParserService {
  constructor() {}

  parseMprFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const arrayBuffer = event.target.result;
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));
      const result = parseMPR(buffer);
      console.log(result);
      this.generateGraph(result);
    };
    reader.readAsArrayBuffer(file);
  }

  generateGraph(data: any): void {
    const trace:any = {
      x: data.x, // Replace with actual x-axis data from result
      y: data.y, // Replace with actual y-axis data from result
      type: 'scatter'
    };
    const layout = {
      title: 'Electrochemistry Graph',
      xaxis: {
        title: 'X-Axis'
      },
      yaxis: {
        title: 'Y-Axis'
      }
    };
    Plotly.newPlot('graphDiv', [trace], layout);
  }
}

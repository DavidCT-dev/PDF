import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConvertPdf } from './dto/convert.dto';
import * as puppeteer from 'puppeteer';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { PdfBase64, PdfBase64Document } from './schema/base64.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('convert')
@Controller('/convert')
export class AppController {
  constructor(
    @InjectModel(PdfBase64.name) private pdfModel: Model<PdfBase64Document>,
    ) {}

  @Get('/:id')
  async getPdf(@Param('id') id: string,@Res() res:Response){
    const pdf = await this.pdfModel.findById(id)
    res.json({
      _id: pdf._id,
      pdfBase64:pdf.pdfBase64
    })
  }

  @Put('/:id')
  async updatePdf(@Param('id') id: string, @Res() res: Response, @Body() requestBody: ConvertPdf){
    const { textPlain } = requestBody;
    function getBolivianTime() {
      const now = new Date();
      const offset = -4; 
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const bolivianTime = new Date(utc + 3600000 * offset);

      const year = bolivianTime.getFullYear();
      const month = (bolivianTime.getMonth() + 1).toString().padStart(2, '0');
      const day = bolivianTime.getDate().toString().padStart(2, '0');
      console.log(year,month,day)
      const hours = bolivianTime.getHours();
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const amOrPm = hours >= 12 ? 'PM' : 'AM';

      const minutes = bolivianTime.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      const seconds = bolivianTime.getSeconds();
      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

      return `${year}/${month}/${day} - ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${amOrPm}`;
  }
  const bolivianTime = getBolivianTime();
      if(!textPlain) throw new HttpException('error texto plano no definido ',404)

    const browser = await puppeteer.launch({
        headless:false,
        executablePath: 'C:/Program Files/Google/Chrome/Application/Chrome.exe',
        // executablePath: '/usr/bin/chromium',
        // args: ['--no-sandbox'],
        defaultViewport:{
          width:750,
          height:500,
          deviceScaleFactor:1,
          isMobile:true,
          hasTouch:false,
          isLandscape:true
        }
      });

      const page = await browser.newPage();
      await page.setContent(textPlain,{ waitUntil: 'networkidle0' })

      await page.emulateMediaType("screen")


      const base64Img1 = await this.imageToBase64(path.resolve('./logo_red.png'));
      const base64Img2 = await this.imageToBase64(path.resolve('./logo_white.png'));

      const pdf = await page.pdf({
        format:"A4",
        printBackground:true,
        margin: { left:"2cm", top:"2cm", right:"2cm", bottom:"2cm" },
        displayHeaderFooter:true,
        headerTemplate: `
        <div style="margin-left: 50px; display: flex; align-items: center; justify-content: center; font-family: 'Times New Roman', Times, Georgia, serif, cursive; font-size: 14px; color: black;">
        <div style="display: flex; align-items: center; text-align: center;">
          <div style="margin-right: 10px;">
            <img src="data:image/jpg;base64,${base64Img2}" alt="Imagen Izquierda" style="width: 40px; height: 40px;">
          </div>
          <span style="display: flex; text-align: center; flex-direction: column; align-items: center; font-size: 10px;">
            <h3 style="margin: 0;">UNIVERSIDAD AUTÓNOMA TOMÁS FRÍAS</h3>
            <h4 style="margin: 0;">CARRERA DE INGENIERÍA DE SISTEMAS</h4>
            <h4 style="margin: 0;">FUNDACIÓN DE SOFTWARE LIBRE</h4>
            <h5 style="margin: 0;">Potosí - Bolivia</h5>
          </span>
          <div style="margin-left: 10px;">
            <img src="data:image/jpg;base64,${base64Img1}" alt="Imagen Derecha" style="width: 40px; height: 40px;">
          </div>
        </div>
      </div> 
        `
      })

      await browser.close();

    const base64Pdf = pdf.toString('base64');

    const pdfUpdated = await this.pdfModel.findByIdAndUpdate(id,{pdfBase64:base64Pdf},{new:true})
    // console.log(newPDF.pdfBase64)
    res.json({
      _id: pdfUpdated._id,
      pdfBase64:pdfUpdated.pdfBase64
    })
  }

  @Delete('/:id')
  async deletePdf(@Param('id') id: string){
     const pdf=await this.pdfModel.findByIdAndDelete(id)
     if(!pdf){
        throw new  HttpException("reporte no encontrado ",404)
     }

     return pdf 
  }
  

  @Post()
  async createText(@Res() res: Response, @Body() requestBody: ConvertPdf) {
    const { textPlain } = requestBody;

    function getBolivianTime() {
      const now = new Date();
      const offset = -4; 
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const bolivianTime = new Date(utc + 3600000 * offset);

      const year = bolivianTime.getFullYear();
      const month = (bolivianTime.getMonth() + 1).toString().padStart(2, '0');
      const day = bolivianTime.getDate().toString().padStart(2, '0');
      console.log(year,month,day)
      const hours = bolivianTime.getHours();
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const amOrPm = hours >= 12 ? 'PM' : 'AM';

      const minutes = bolivianTime.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      const seconds = bolivianTime.getSeconds();
      const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

      return `${year}/${month}/${day} - ${formattedHours}:${formattedMinutes}:${formattedSeconds} ${amOrPm}`;
  }
  const bolivianTime = getBolivianTime();
    if(!textPlain) throw new HttpException('error texto plano no definido ',404)

    const browser = await puppeteer.launch({
        headless:false,
        executablePath: 'C:/Program Files/Google/Chrome/Application/Chrome.exe',
        // executablePath: '/usr/bin/chromium',
        // args: ['--no-sandbox'],
        defaultViewport:{
          width:750,
          height:500,
          deviceScaleFactor:1,
          isMobile:true,
          hasTouch:false,
          isLandscape:true
        }
      });

      const page = await browser.newPage();
      await page.setContent(textPlain,{ waitUntil: 'networkidle0' })

      await page.emulateMediaType("screen")


      const base64Img1 = await this.imageToBase64(path.resolve('./logo_red.png'));
      const base64Img2 = await this.imageToBase64(path.resolve('./logo_white.png'));
      
      const pdf = await page.pdf({
        format:"A4",
        printBackground:true,
        margin: { left:"2cm", top:"2cm", right:"2cm", bottom:"2cm" },
        displayHeaderFooter:true,
        headerTemplate: `
        <div style="margin-left: 50px; display: flex; align-items: center; justify-content: center; font-family: 'Times New Roman', Times, Georgia, serif, cursive; font-size: 14px; color: black;">
          <div style="display: flex; align-items: center; text-align: center;">
            <div style="margin-right: 10px;">
              <img src="data:image/jpg;base64,${base64Img2}" alt="Imagen Izquierda" style="width: 40px; height: 40px;">
            </div>
            <span style="display: flex; text-align: center; flex-direction: column; align-items: center; font-size: 10px;">
              <h3 style="margin: 0;">UNIVERSIDAD AUTÓNOMA TOMÁS FRÍAS</h3>
              <h4 style="margin: 0;">CARRERA DE INGENIERÍA DE SISTEMAS</h4>
              <h4 style="margin: 0;">FUNDACIÓN DE SOFTWARE LIBRE</h4>
              <h5 style="margin: 0;">Potosí - Bolivia</h5>
            </span>
            <div style="margin-left: 10px;">
              <img src="data:image/jpg;base64,${base64Img1}" alt="Imagen Derecha" style="width: 40px; height: 40px;">
            </div>
          </div>
        </div>     
      `,
        footerTemplate:`
        <div style="font-size: 10px; display: flex; align-items: center; justify-content: space-between; height: 20px; margin-top: 10px;">
            <span style="margin-left: 50px;">${bolivianTime}</span>
            <span style="text-align: right; margin-right: 50px;">
                Page <span class="pageNumber">1</span> of <span class="totalPages">1</span>
            </span>
        </div>
        `
      })

      await browser.close();

    const base64Pdf = pdf.toString('base64');

    const newPDF = await new this.pdfModel({
      pdfBase64:base64Pdf
    })

    newPDF.save()
    res.json({
      _id: newPDF._id,
      pdfBase64:newPDF.pdfBase64
    })

  }
  async imageToBase64(filePath) {
    const image = fs.readFileSync(filePath);
    return image.toString('base64');
  }
}

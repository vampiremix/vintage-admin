import { Component, OnInit, ViewChild } from '@angular/core';
import { ServerConfig } from 'app/provider/server.config';
import { Router } from '@angular/router';
import { PubSubService } from 'angular2-pubsub';
import { BidService } from 'app/bid/bid.service';
import { MomentModule } from 'angular2-moment';
declare let $: any;

@Component({
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.scss']
})
export class BidComponent implements OnInit {
  @ViewChild('modalbid') modalbid;
  @ViewChild('modalBidDetail') modalBidDetail;
  @ViewChild('prdimgInput') prdimgInput;
  private ACTION_BID: string;
  private addImgPrd: Array<string> = [];
  private ImgprdEdit: Array<string> = [];
  private isEditImage: boolean = false;
  private bidData: any = {};
  private bidlist: Array<any> = [];
  private selectedTab: number = 0;
  private oldDate: any = {};
  private shippingMaster: Array<any> = [];
  private shippingMasterOld: Array<any> = [];
  private shippings: Array<any> = [];
  private curentPage: Array<any> = [];
  private typeTab: string = '';
  private currentPageSelected: number = 0;
  private keyword: string = '';
  private pageSelect: number = 0;
  private input_err_start: boolean = false;
  private input_err_end: boolean = false;
  private txtErr_start: string;
  private txtErr_end: string;
  private winnerBid: string;
  private showWinnerBid: boolean = false;

  constructor(private server: ServerConfig, private router: Router, private pubsub: PubSubService, private bidService: BidService) { }

  ngOnInit() {
    this.server.isLogin().subscribe(data => {
      if (!data) {
        this.router.navigate(['/login']);
      } else {
        this.pubsub.$pub('loading', true);
        this.InitialData();
      }
    });
  }

  search() {
    this.pubsub.$pub('loading', true);
    this.curentPage = [];
    this.pageSelect = 0;
    this.curentPage[1] = 'active';
    this.currentPageSelected = 0;
    this.typeTab = this.typeTab;
    this.selectedTab = this.selectedTab;
    this.getBidList();
  }

  pageing(page: number) {
    this.pubsub.$pub('loading', true);
    this.currentPageSelected = page;
    this.pageSelect = 0;
    this.curentPage = [];
    this.pageSelect = (page - 1) * 10;
    this.curentPage[page] = 'active';
    this.getBidList();
  }

  pageingN() {

    let bidlist = JSON.parse(JSON.stringify(this.bidlist));
    if (this.currentPageSelected === 0) {
      this.currentPageSelected = 1;
    }
    this.currentPageSelected++;
    if (bidlist.paging.length >= this.currentPageSelected) {
      this.pubsub.$pub('loading', true);
      this.pageSelect = 0;
      this.curentPage = [];
      this.pageSelect = (this.currentPageSelected - 1) * 10;
      this.curentPage[this.currentPageSelected] = 'active';
      this.getBidList();
    } else {
      this.currentPageSelected--;
    }
  }

  pageingP() {
    let oldpage = this.currentPageSelected;
    let bidlist = JSON.parse(JSON.stringify(this.bidlist));
    if (this.currentPageSelected > 1) {
      this.currentPageSelected--;
    }
    console.log(this.currentPageSelected);
    if (bidlist.paging.length >= this.currentPageSelected && this.currentPageSelected > 0 && this.currentPageSelected !== oldpage) {
      this.pubsub.$pub('loading', true);
      this.pageSelect = 0;
      this.curentPage = [];
      this.pageSelect = (this.currentPageSelected - 1) * 10;
      this.curentPage[this.currentPageSelected] = 'active';
      this.getBidList();
    }
  }

  getBidList() {
    const params = {
      title: this.typeTab,
      currentpage: this.currentPageSelected,
      keyword: this.keyword
    };
    this.bidService.getBidList(params).subscribe((data) => {
      this.bidlist = data;
      this.pubsub.$pub('loading', false);
    });
  }

  InitialData() {
    const params = {
      title: '',
      currentpage: 0,
      keyword: ''
    };
    this.bidService.getBidList(params).subscribe((data) => {
      this.bidlist = data;
      if (data.paging.length > 0) {
        this.curentPage[1] = 'active';
      }
      this.pubsub.$pub('loading', false);
    });
    this.bidService.getShipingMaster().subscribe(data => {
      this.shippingMaster = data;
      this.shippingMasterOld = data;
    }, err => {
      console.log(err);
      alert('ไม่สามารถโหลดข้อมูล Shipping Master ได้');
    });
  }

  calcDate(_type) {
    let date = new Date(this.bidData.starttime);
    let _month = date.getMonth() <= 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let _date = date.getDate() <= 9 ? '0' + date.getDate() : date.getDate();
    let _incHr = date.getHours() <= 9 ? '0' + date.getHours() : date.getHours();
    let _incMin = date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes();
    let defaultDate = date.getFullYear() + '-' + _month + '-' + _date + 'T' + _incHr + ':' + _incMin + ':00';

    let dateEnd = new Date(this.bidData.endtime);
    let month_end = dateEnd.getMonth() <= 9 ? '0' + (dateEnd.getMonth() + 1) : dateEnd.getMonth() + 1;
    let date_end = dateEnd.getDate() <= 9 ? '0' + dateEnd.getDate() : dateEnd.getDate();
    let incHr_end = dateEnd.getHours() <= 9 ? '0' + dateEnd.getHours() : dateEnd.getHours();
    let incMin_end = dateEnd.getMinutes() <= 9 ? '0' + dateEnd.getMinutes() : dateEnd.getMinutes();
    let defaultDateEnd = dateEnd.getFullYear() + '-' + month_end + '-' + date_end + 'T' + incHr_end + ':' + incMin_end + ':00';

    let dateNow = new Date();
    let month_n = dateNow.getMonth() <= 9 ? '0' + (dateNow.getMonth() + 1) : dateNow.getMonth() + 1;
    let date_n = dateNow.getDate() <= 9 ? '0' + dateNow.getDate() : dateNow.getDate();
    let incHr_n = dateNow.getHours() <= 9 ? '0' + dateNow.getHours() : dateNow.getHours();
    let incMin_n = dateNow.getMinutes() <= 9 ? '0' + dateNow.getMinutes() : dateNow.getMinutes();
    let defaultDateNow = dateNow.getFullYear() + '-' + month_n + '-' + date_n + 'T' + incHr_n + ':' + incMin_n + ':00';

    let oneDay = 24 * 60 * 60 * 1000;

    let firstDate_1 = new Date(defaultDateNow);
    let secondDate_1 = new Date(defaultDate);
    let diffDaysNow = Math.abs((firstDate_1.getTime() - secondDate_1.getTime()) / (oneDay));

    let firstDate_2 = new Date(defaultDate);
    let secondDate_2 = new Date(defaultDateEnd);
    let diffDaysFirstAndEnd = Math.abs((firstDate_2.getTime() - secondDate_2.getTime()) / (oneDay));

    if (_type === 'start') {
      if (!isNaN(secondDate_1.getTime())) {
        if (secondDate_1.getTime() >= firstDate_1.getTime()) {
          this.oldDate = {
            starttime: this.bidData.starttime,
            endtime: this.bidData.starttime
          };
          this.input_err_start = false;
          this.input_err_end = false;
          this.txtErr_start = '';
          this.txtErr_end = '';
        } else {
          this.input_err_start = true;
          this.txtErr_start = 'ต้องไม่น้อยกว่าวันปัจจุบัน';
          // alert('ต้องไม่น้อยกว่าวันปัจจุบัน');
          // let defaultDateNow_mod = dateNow.getFullYear() + '-' + month_n + '-' + date_n + 'T' + incHr_n + ':' + incMin_n;
          // this.bidData.starttime = '';
          // this.bidData.endtime = '';
          // setTimeout(() => {
          //   this.bidData.starttime = defaultDateNow_mod;
          //   this.bidData.endtime = defaultDateNow_mod;
          // }, 50);
        }
      }
    } else if (_type === 'end') {
      if (diffDaysFirstAndEnd >= 0 && diffDaysFirstAndEnd <= 1 && secondDate_2.getTime() >= firstDate_2.getTime()) {
        this.oldDate = {
          starttime: this.bidData.starttime,
          endtime: this.bidData.starttime
        };
        this.input_err_start = false;
        this.input_err_end = false;
        this.txtErr_start = '';
        this.txtErr_end = '';
      } else {
        // alert('ต้องไม่เกิน 24 ชั่วโมง');
        this.input_err_end = true;
        this.txtErr_end = 'ต้องไม่เกิน 24 ชั่วโมง';
        // this.bidData.starttime = '';
        // this.bidData.endtime = '';
        // setTimeout(() => {
        //   this.bidData.starttime = this.oldDate.starttime;
        //   this.bidData.endtime = this.oldDate.endtime;
        // }, 50);
      }
    }
  }

  selectShipping(item) {
    let index = this.shippings.findIndex(i => i._id === item._id);
    if (index === -1) {
      this.shippings.push(item);
    } else {
      for (let i = 0; i < this.shippings.length; i++) {
        if (this.shippings[i]._id === item._id) {
          this.shippings.splice(i, 1);
          break;
        }
      }
    }
  }

  setShippingPrice(id, e) {
    let price = parseFloat(e.target.value);
    for (let i = 0; i < this.shippings.length; i++) {
      if (this.shippings[i]._id === id) {
        this.shippings[i].price = price ? price : 0;
      }
    }
  }

  selectTab(index, typeTab) {
    this.pubsub.$pub('loading', true);
    this.curentPage = [];
    this.pageSelect = 0;
    this.curentPage[1] = 'active';
    this.currentPageSelected = 1;
    this.typeTab = typeTab;
    this.selectedTab = index;
    this.getBidList();
  }

  addBid() {
    this.addImgPrd = [];
    this.bidData = {};
    this.input_err_start = false;
    this.input_err_end = false;
    this.ACTION_BID = 'เพิ่ม';
    this.shippings = [];
    this.shippingMaster.forEach((e, i) => {
      e.isChecked = false;
    });
    $(this.modalbid.nativeElement).modal('show');
    let date = new Date();
    let _month = date.getMonth() <= 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let _date = date.getDate() <= 9 ? '0' + date.getDate() : date.getDate();
    let _incHr = date.getHours() <= 9 ? '0' + date.getHours() : date.getHours();
    let _incMin = date.getMinutes() <= 9 ? '0' + date.getMinutes() : date.getMinutes();
    let defaultDate = date.getFullYear() + '-' + _month + '-' + _date + 'T' + _incHr + ':' + _incMin + ':00';
    this.bidData.starttime = defaultDate;
    this.bidData.endtime = defaultDate;
    this.oldDate = {
      starttime: this.bidData.starttime,
      endtime: this.bidData.starttime
    };
  }

  cancelAddBid() {
    $(this.modalbid.nativeElement).modal('hide');
    this.addImgPrd = [];
    this.ImgprdEdit = [];
    this.bidData = {};
  }

  cancelBidDetail() {
    $(this.modalBidDetail.nativeElement).modal('hide');
  }

  editBid(item) {
    let selection = window.getSelection();
    if (selection.toString().length === 0) {
      this.ACTION_BID = 'แก้ไข';
      this.bidData = JSON.parse(JSON.stringify(item));
      this.addImgPrd = this.bidData.image;
      this.shippingMaster.forEach((e, i) => {
        e.isChecked = false;
      });

      this.winnerBid = this.bidData.userbid.length > 0 ? this.bidData.userbid.reverse()[0].user.displayName : '-';

      setTimeout(() => {
        for (let i = 0; i < this.shippingMaster.length; i++) {
          for (let j = 0; j < this.bidData.shippings.length; j++) {
            if (this.shippingMaster[i]._id === this.bidData.shippings[j].ref._id) {
              this.shippingMaster[i].isChecked = true;
            }
          }
        }
      }, 200);

      setTimeout(() => {
        let shippings: Array<any> = [];
        this.bidData.shippings.forEach((e, i) => {
          shippings.push({
            _id: e.ref._id,
            price: e.price,
            name: e.ref.name,
            detail: e.ref.detail,
            isChecked: true
          });
        });
        this.shippings = shippings;
      }, 100);
      this.bidData.starttime = this.bidData.starttime.replace(':00.000Z', '');
      this.bidData.endtime = this.bidData.endtime.replace(':00.000Z', '');
      console.log(this.bidData);
      if (this.typeTab === 'รอการประมูล') {
        this.showWinnerBid = false;
        $(this.modalbid.nativeElement).modal('show');
      } else {
        this.showWinnerBid = true;
        $(this.modalBidDetail.nativeElement).modal('show');
      }
    }

  }

  deleteBid(item) {
    const cfDelete = confirm('ยืนยันการลบการประมูลนี้');
    if (cfDelete) {
      this.pubsub.$pub('loading', true);
      this.bidService.deleteBid(item).subscribe(data => {
        this.InitialData();
      }, err => {
        console.log(err);
      });
    }
  }

  upImgPrd() {
    this.prdimgInput.nativeElement.click();
  }
  removeprdImg(index) {
    this.addImgPrd.splice(index, 1);
    if (this.addImgPrd.length === 0) {
      this.isEditImage = false;
    }
  }

  removeprdImgEDIT(index) {
    this.ImgprdEdit.splice(index, 1);
    if (this.ImgprdEdit.length === 0) {
      this.isEditImage = false;
    }
  }

  onupImgPrdChange($event) {
    const fileBrowser = this.prdimgInput.nativeElement;
    const reader = new FileReader();
    if (fileBrowser.files.length > 0) {
      reader.readAsDataURL(fileBrowser.files[0]);
      reader.onload = () => {
        this.isEditImage = true;
        let result = reader.result.replace(/\n/g, '');
        if (this.ACTION_BID === 'เพิ่ม') {
          this.addImgPrd.push(result);
        } else if (this.ACTION_BID === 'แก้ไข') {
          this.ImgprdEdit.push(result);
        }
      };
    }
  }

  saveBid() {
    if (this.addImgPrd.length <= 0) {
      alert('กรุณาเพิ่มรูปสินค้า');
    } else if (!this.bidData.name) {
      alert('กรุณาใส่ชื่อสินค้า');
    } else if (this.bidData.startprice === undefined || this.bidData.startprice === null) {
      alert('กรุณาใส่ราคาเริ่มต้น');
    } else if (!this.bidData.bidprice) {
      alert('กรุณาใส่ราคาเคาะประมูล');
    } else if (!this.bidData.starttime || this.input_err_start) {
      alert('กรุณาใส่วันที่เริ่มต้นประมูล');
    } else if (!this.bidData.endtime || this.input_err_end) {
      alert('กรุณาใส่วันที่สิ้นสุดประมูล');
    } else if (this.shippings.length <= 0) {
      alert('กรุณาเลือกการจัดส่ง');
    } else {
      this.pubsub.$pub('loading', true);
      let refShippings: Array<any> = [];
      this.shippings.forEach((e, i) => {
        refShippings.push({
          ref: {
            _id: e._id,
          },
          price: e.price ? e.price : 0
        });
      });
      this.bidData.shippings = refShippings;
      if (this.ACTION_BID === 'เพิ่ม') {
        let image: Array<any> = [];
        let countUpload: any = 0;
        for (let i = 0; i < this.addImgPrd.length; i++) {
          this.bidService.uploadImage(this.addImgPrd[i]).subscribe(data => {
            countUpload += 1;
            image.push(data.imageURL);
            if (countUpload === this.addImgPrd.length) {
              this.bidData.image = image;
              this.bidService.saveBid(this.bidData).subscribe(res => {
                this.pubsub.$pub('loading', false);
                this.getBidList();
                alert('เพิ่มการประมูลเรียบร้อยแล้ว');
                this.shippingMaster = [];
                setTimeout(() => {
                  this.shippingMaster = this.shippingMasterOld;
                  this.shippingMaster.forEach((e, i) => {
                    e.isChecked = false;
                  });
                  $(this.modalbid.nativeElement).modal('hide');
                }, 200);
              }, errRes => {
                console.log(errRes);
                this.pubsub.$pub('loading', false);
                alert('ไม่สามารถเพิ่มการประมูลได้');
              });
            }
          }, err => {
            console.log(err);
            this.pubsub.$pub('loading', false);
            alert('ไม่สามารถอัพโหลดรูปได้');
          });
        }
      } else if (this.ACTION_BID === 'แก้ไข') {
        this.bidService.editBid(this.bidData).subscribe(data => {
          this.pubsub.$pub('loading', false);
          alert('แก้ไขข้อมูลเรียบร้อย');
          $(this.modalbid.nativeElement).modal('hide');
          this.getBidList();
        }, err => {
          console.log(err);
          this.pubsub.$pub('loading', false);
          alert('ไม่สามารถแก้ไขข้อมูลได้');
        });
      }
    }
  }
}

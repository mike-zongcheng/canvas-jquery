var Canvas=function canvas(canvas){
	var _self = this;
	_self.slideIndex = 1;//第二屏的第几小块
	_self.intertimer = null;
	var setUp={
		contextAll:null,//context集合
		canvasSet:canvas.canvasSet,//canvas动画详细参数
		imgSrc:null,//图片缓存路径
		timer:[],//动画执行定时器
		imgBoolean:false, //图片是否缓存完成
		nextIndex:null,//上一个canvas下标
		callback:canvas.callback,//canvas载入完成后的回调函数
		maxPage:canvas.maxPage ? canvas.maxPage : 1000,//共几页含有canvas动画
		timeInterval:[],//动画间隔定时器
		timeDelay:null,//动画延迟定时器
		animTime:[], //animate间隔定时器
		actionTime:null,//动作定时器
		frame_delay:null, //递归表单式
		singleTime:[] //递归内定时器
	}
	var winWidth = $(window).width(),winHeight = $(window).height();
	
	Caching(canvas.imgSrc);//初始化

	function Caching(Json){
		var beauty ={},jsonKey;
		for(var i in Json){
			beauty[i] = new Image();  
			beauty[i].src = Json[i];
			jsonKey = i;
		}
		beauty["page1_character"].onload=function(){
			setUp.imgBoolean = true;
			setUp.imgSrc = beauty;
			for(var i in setUp.canvasSet){
				for(var j in setUp.canvasSet[i].img){
					for(var k in setUp.canvasSet[i].img[j].name){
						setUp.canvasSet[i].img[j].name[k] = setUp.imgSrc[setUp.canvasSet[i].img[j].name[k]];
					}
				}
			}
			_self.newDom(setUp.canvasSet)
		}
	}//缓存文件并返回一个JSON数组并将canvasSet.img路径更换为图片缓存
	
	function setTime(obj,context,objBottom){
		var objCanvas = $("#"+obj.id),canvasBottom = obj.y >=0 ? obj.y : obj.y/-1 ;
		context.drawImage(obj.name[0],0,0,obj.minWidth,obj.minHeight,0,0,obj.minWidth,obj.minHeight);

		clearInterval(setUp.animTime[0])
		clearInterval(setUp.animTime[1])
		clearInterval(setUp.animTime[2])
		var testBottom = canvasBottom - obj.path.top;
		objCanvas.css({"bottom": testBottom})
		setUp.animTime[0] = setTimeout(function(){
			//console.log(objCanvas.css("transition"))
			objCanvas.css({"transition":"100ms","bottom":canvasBottom - obj.path.rebound});
		},obj.path.ms)
		setUp.animTime[1] = setTimeout(function(){
			objCanvas.css("bottom",canvasBottom - obj.path.top);
			objCanvas.css({"transition":0})
		},obj.path.ms+100)

		setUp.singleTime[2] = setTimeout(function(){
			context.clearRect(0,0,obj.minWidth,obj.minHeight)
		},obj.time)
	}//第二屏初始化函数

	/*	$(function(){
		$(".obj").css({"top":200,"transition":"2s"})
	})*/

	_self.newDom = function (Json,index){
		clearInterval(setUp.animTime[0])
		clearInterval(setUp.animTime[1])
		clearInterval(setUp.animTime[2])
		
		clearInterval(setUp.singleTime[0]);
		clearInterval(setUp.singleTime[1]);
		clearInterval(setUp.singleTime[2]);

		clearInterval(setUp.timer[0])
		clearInterval(setUp.timeInterval[0]);
		if(index >= setUp.maxPage){
			return;
		}
		if(index || index == 0){
			for(var i in setUp.canvasSet[index].img){
				var content = setUp.contextAll[setUp.canvasSet[index].img[i].id],active = setUp.canvasSet[index].img[i];
				content.clearRect(0,0,active.minWidth,active.minHeight);
				if(active.delay){
					return;
				}else{
					content.drawImage(active.name[0],0,0,active.minWidth,active.minHeight,0,0,active.minWidth,active.minHeight);
				}
			}
			return;
		}//恢复初始状态
		if(!Json){
			return;
		}
		var context={};
		
		for(i in Json){
			for(var k in Json[i].img){
				var obj = Json[i].img[k],canvasBottom=obj.y > 0?"top:"+obj.y+"px":"bottom:"+obj.y/-1+"px";
				obj.id ? true : obj.id = "section"+i+"_"+(k-0+1);
				Json[i].obj.children("div").prepend("<canvas id="+obj.id+" style='position: absolute; left:"+obj.x+"px;"+canvasBottom+";' width="+obj.minWidth+" height="+obj.minHeight+"></canvas>");
				context[obj.id] = $("#"+obj.id)[0].getContext('2d');
				if(obj.delay){
				}else{
					context[obj.id].drawImage(obj.name[0],0,0,obj.minWidth,obj.minHeight,0,0,obj.minWidth,obj.minHeight);
				}
				
			}
		}
		
		setUp.contextAll = context;
		setUp.callback();
	}//建立canvas元素并创建初始帧

	_self.anim = function(index){
		clearInterval(setUp.singleTime[0]);
		clearInterval(setUp.singleTime[1]);
		clearInterval(setUp.singleTime[2]);
		clearInterval(setUp.timeInterval[0]);
		for(var i in setUp.timer){
			clearInterval(setUp.timer[i])
		}
		for(var i in setUp.timeInterval){
			clearInterval(setUp.timeInterval[i])
		}
		clearInterval(setUp.timeDelay)

		if(!index && index!=0 ){
			return false;
		}
		if(!setUp.canvasSet[index]){
			return false;
		}
		var settings = setUp.canvasSet[index].img;
		function frame(setting,index,inter){
			var reverse=false,x = 0,y = 0,active = 0,objCanvas = $("#"+setting.id),canvasBottom = parseInt(objCanvas.css("top"));
			clearInterval(setUp.timer[0])
			setUp.timer[index] = setInterval(function(){
				context = setUp.contextAll[setting.id];

				context.clearRect(0,0,setting.minWidth,setting.minHeight);
				if( x >= setting.maxWidth-setting.minWidth || reverse){
					
					if(x <= 0){
						reverse = false;
						x += setting.minWidth;
						context.drawImage(setting.name[0],x,y,setting.minWidth,setting.minHeight,0,0,setting.minWidth,setting.minHeight);

					}else{
						reverse = true;
						x -= setting.minWidth;
						context.drawImage(setting.name[0],x,y,setting.minWidth,setting.minHeight,0,0,setting.minWidth,setting.minHeight);
					}
				}else{
					x += setting.minWidth;
					context.drawImage(setting.name[0],x,y,setting.minWidth,setting.minHeight,0,0,setting.minWidth,setting.minHeight);	
				}
				
			}, setting.time)
		}//定时器动画
		
		
		function frame_inter(setting,index,inter){
			var x = 0,y=0,status = false;
			clearInterval(_self.intertimer)
			_self.intertimer = setInterval(function(){
				context = setUp.contextAll[setting.id];

				context.clearRect(0,0,setting.minWidth,setting.minHeight);
				if( x >= setting.maxWidth-setting.minWidth || status){
					
					if(!setting.cycle){
						status = true;
						x -= setting.minWidth;
						context.drawImage(setting.name[0],x,y,setting.minWidth,setting.minHeight,0,0,setting.minWidth,setting.minHeight);
						return false;
					}
					x = 0;
					if(setting.display){
						clearInterval(_self.intertimer)
						return false;
					}
					context.drawImage(setting.name[0],0,0,setting.minWidth,setting.minHeight,0,0,setting.minWidth,setting.minHeight);
					clearInterval(_self.intertimer)
					return false;
				}else{
					x += setting.minWidth;
					context.drawImage(setting.name[0],x,y,setting.minWidth,setting.minHeight,0,0,setting.minWidth,setting.minHeight);	
				}
				
			}, setting.time)
		}//第二屏光晕定时器动画

		var num = 1;

		setUp.frame_delay = null;

		setUp.frame_delay=function (time,setting,objCanvas,canvasBottom,singlsStop){
			var context = setUp.contextAll[setting.id];

			clearInterval(setUp.singleTime[0]);
			clearInterval(setUp.singleTime[1]);
			clearInterval(setUp.singleTime[2]);

			setUp.singleTime[0]=setInterval(function(){
				
				context.clearRect(0,0,setting.minWidth,setting.minHeight)
				
				setUp.singleTime[1] = setTimeout(function(){
					context.drawImage(setting.name[0],0,0,setting.minWidth,setting.minHeight,0,0,setting.minWidth,setting.minHeight);

					objCanvas.css({"transition":"0ms","bottom":canvasBottom})

					setTimeout(function(){
						objCanvas.css({"transition":"300ms","bottom":canvasBottom - setting.path.top})
					},20)
				
					setUp.animTime[0] = setTimeout(function(){
						objCanvas.css({"transition":"100ms","bottom":canvasBottom - setting.path.rebound});
					},setting.path.ms)
					

					setUp.animTime[1] = setTimeout(function(){
						objCanvas.css("bottom",canvasBottom - setting.path.top);
					},setting.path.ms+100)

				},setting.delay)
				
			},setting.delay + setting.time)

			canvasBottom = setting.y/-1;
			return;	
		}//第二屏人物定时器函数

		for(var i in settings){
			var setting =  settings[i];
			if(settings[i].delay){
				var settingInter = settings[i],k = i,obj = $("#"+settingInter.id),objBottom = parseInt($("#"+settingInter.id).css("bottom"));
				clearInterval(setUp.timeDelay)
				obj.css({"transition":"0","bottom":setting.y/-1})
				setUp.timeDelay = setTimeout(function(){
					setTime(setting,setUp.contextAll[setting.id],objBottom)
				}, 500)

				setUp.frame_delay(settingInter.time,settingInter,obj,objBottom,true,objBottom);
			}else if(settings[i].interval){
				var settingIntera = settings[i],j = i;

				frame_inter(settingIntera,j,settingIntera.interval);
				setUp.timeInterval[i]=setInterval(function(){
					frame_inter(settingIntera,j,settingIntera.interval);
				},settingIntera.interval)
				
			}else{
				frame(setting,i);
			}
		}//循环调用定时器动画
		
		/*
			imgAll  当前canvas下的缓存图片
			active  当前执行的图片
		 */
	}//canvas刷新帧
	
}
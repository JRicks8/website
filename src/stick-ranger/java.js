// @ts-nocheck

function cookie_get(nm){
	var r=[],dc=document.cookie;
	if(dc){
		var c=dc.split('; ');
		for(var i=0; i<c.length; i++){
			var k=c[i].split('=');
			if(k[0]===nm && k[1]!=''){
				k[1]=decodeURIComponent(k[1]);
				if('user'===nm){
					r=k[1].substr(0,k[1].indexOf(':')).split('_');
					r[6]=k[1].substr(k[1].indexOf(':')+1);
				}else{
					r[0]=k[1];
				}
				break;
			}
		}
	}
	return(r);
}
function cvs_mv2(gw,gh,ss,as,ab,ms){
	var d=document;
	var c=d.getElementById('cv');
	var s=d.getElementById('sp_info').getBoundingClientRect();
	var i=c.getBoundingClientRect();
	var w=window.innerWidth;
	var h=window.innerHeight;
	var mrs=d.getElementById('mrw_ads').style;
	var cvs=c.style;
	if(ss<=w){
		var l=i.left+i.width+150-s.left;
		if(s.left>i.left && 0<l)	mrs.left=l+'px';
		else						mrs.left='0';
		cvs.width=gw+'px';
		cvs.height=gh+'px';
	}else{
		mrs.left='0';
		w=d.body.clientWidth;
		var sc=(gw/gh>w/h)?w/gw:h/gh;
		sc=Math.min(sc,ms);
		cvs.width=(gw*sc)+'px';
		cvs.height=(gh*sc)+'px';
	}
	var p=window.devicePixelRatio;
	if(!p)	p=1;
	if(gw>(w*p) || gh>(h*p)){
		if(0===as)	c.classList.add('nrnb');
		else		c.classList.remove('nrnb');
	}else{
		if(0===ab)	c.classList.add('nrnb');
		else		c.classList.remove('nrnb');
	}
	window.onresize=function(){cvs_mv2(gw,gh,ss,as,ab,ms);}
}
var ajax_a=new Array();
var ajax_f=new Array();
function ajax(u,c){
	ajax_f[u]=c;
	try{
		ajax_a[u]=new ActiveXObject('Msxml2.XMLHTTP');
	}catch(e){
		try{
			ajax_a[u]=new ActiveXObject('Microsoft.XMLHTTP');
		}catch(e){
			if(typeof XMLHttpRequest!='undefined')	ajax_a[u]=new XMLHttpRequest();
			else									return;
		}
	}
	if(c!=''){
		ajax_a[u].onreadystatechange=function(){
			if(ajax_a[u].readyState===4 && ajax_a[u].status===200)
				setTimeout(ajax_f[u]+'(\''+ajax_a[u].responseText+'\')',0);
		}
	}
	ajax_a[u].open('POST','\/'+u,true);
	ajax_a[u].send(Date.now());
}
function dust12_view(v,l,d){
	var w='',pt=d[2];
	var vt=['票','vote'];
	var vn=[['※自分の作品には投票出来ません。',	'* You can\'t vote for your own artwork.'],
			['※3ヶ月前の作品には投票出来ません。',	'* You can\'t vote for works older than 3 months.'],
			['※1作品に1回のみ評価出来ます。',		'* You can evaluation only 1 time for each work.'],
			['※投票ありがとう御座います。',		'* Thank you for voting.'],
			['※削除依頼されました。',				'* Your deletion request is sent.']];
	var gn=['面白いので拍手','&nbsp;&nbsp;&nbsp;Vote&nbsp;&nbsp;&nbsp;'];
	var dn=['削除依頼'		,'Delete'];
	var dw=[241				,194];
	w+='<H1 CLASS="F0 bttl" STYLE="MARGIN:0;">｢'+utf8_hex(d[1])+'｣<\/H1>';
	w+='<DIV ALIGN="CENTER" STYLE="WHITE-SPACE:pre;">';
		w+='<DIV CLASS="star" STYLE="DISPLAY:inline-block;"><DIV CLASS="star_c';
			if(pt<10)		w+='0" STYLE="LEFT:'+(Math.round((pt- 0)*6.11)-55)+'px;">';
			else if(pt<50)	w+='1" STYLE="LEFT:'+(Math.round((pt- 9)*1.37)-55)+'px;">';
			else if(pt<100)	w+='2" STYLE="LEFT:'+(Math.round((pt-49)*1.12)-55)+'px;">';
			else if(pt<500)	w+='3" STYLE="LEFT:'+(Math.round((pt-99)*0.12)-55)+'px;">';
			else			w+='4">';
		w+='<\/DIV><SPAN CLASS="star_span"><\/SPAN><\/DIV>'+('      '+pt).slice(-6)+vt[l]+'<BR>';
		w+='by '+utf8_hex(d[3])+'<BR>';
		w+=d[4];
	w+='<\/DIV>';
	if(5===d[5]){
		w+='<DIV STYLE="MARGIN:0 auto;MAX-WIDTH:'+dw[l]+'px;WIDTH:100%;TEXT-ALIGN:right;">';
			w+='<A HREF="javascript:void(0)" CLASS="bt_v" ONCLICK="';
				w+='dust12_vote('+v+',0,'+l+',['+d[0]+',\''+d[1]+'\','+d[2]+',\''+d[3]+'\',\''+d[4]+'\',3]);';
			w+='">'+gn[l]+'</A> ';
			w+='<A HREF="javascript:void(0)" CLASS="bt_d" ONCLICK="';
				w+='dust12_vote('+v+',1,'+l+',['+d[0]+',\''+d[1]+'\','+d[2]+',\''+d[3]+'\',\''+d[4]+'\',4]);';
			w+='" >'+dn[l]+'</A>';
		w+='</DIV>';
	}else{
		w+='<FONT COLOR="#FF0000">'+vn[d[5]][l]+'<\/FONT>';
	}
	document.getElementById('d_vote').innerHTML=w;
}
function dust12_vote(v,a,l,d){
	if(a===0)	d[2]++;
	if(v===1)		ajax('javagame\/dust\/vote.php?vote='+a+'&code='+d[0],'');
	else if(v===2)	ajax('javagame\/dust2\/vote.php?vote='+a+'&code='+d[0],'');
	dust12_view(v,l,d);
}
function ll(t,l){
	var f=document.body.appendChild(document.createElement('form'));
	var i=f.appendChild(document.createElement('input'));
	i.type='hidden';
	i.name='ll';
	i.value = l;
	f.action = t.href;
	f.method = 'post';
	f.submit();
}
function dust12_search(v,l,d,c,n){
	var w='',no,hr,sr,pt,ct,nm;
	var ul=['\/','\/en\/'],wh=['','WIDTH="100" HEIGHT="75"','WIDTH="124" HEIGHT="70"'],dh=['','144','139'],vt=['票','vote'],nt=['の作品',' is works'];
	var nw=['','<SPAN>new<\/SPAN><BR>','<BR>'];
	for(var i=0; i<c; i++){
		no=d[(i*6+0)];
		pt=d[(i*6+3)];
		ct=utf8_hex(d[(i*6+1)]);
		nm=utf8_hex(d[(i*6+2)]);
		if(1===v){
			hr=ul[l]+'javagame\/dust\/?code='+no;
			sr='\/images\/dust\/'+(Math.floor(no/1000)*1000)+'\/'+no+'.gif';
		}else{
			hr=ul[l]+'javagame\/dust2\/?code='+no;
			sr='\/images\/dust2\/'+Math.floor(no/1000)+'\/'+no+'.png';
		}
		w+='<DIV CLASS="save_div" STYLE="HEIGHT:'+dh[v]+'px;">';
			w+=nw[d[(i*6+5)]];
			if(n===undefined)	w+='<A HREF="'+hr+'" TITLE="Game No.'+no+' ｢'+ct+'｣" CLASS="save_a">';
			else				w+='<A HREF="'+hr+'" TITLE="Game No.'+no+' ｢'+ct+'｣" CLASS="save_a" ONCLICK="ll(this,'+n+');return false;">';
				w+='<IMG SRC="'+sr+'" '+wh[v]+' CLASS="save_img" ALT="Game No.'+no+' ｢'+ct+'｣"><BR>';
				w+=ct;
			w+='<\/A><BR>';
			w+='<DIV CLASS="star"><DIV CLASS="star_c';
				if(pt<10)		w+='0" STYLE="LEFT:'+(Math.round((pt- 0)*6.11)-55)+'px;">';
				else if(pt<50)	w+='1" STYLE="LEFT:'+(Math.round((pt- 9)*1.37)-55)+'px;">';
				else if(pt<100)	w+='2" STYLE="LEFT:'+(Math.round((pt-49)*1.12)-55)+'px;">';
				else if(pt<500)	w+='3" STYLE="LEFT:'+(Math.round((pt-99)*0.12)-55)+'px;">';
				else			w+='4">';
			w+='<\/DIV><SPAN CLASS="star_span"><\/SPAN><\/DIV>'+('     '+pt).slice(-5)+vt[l]+'<BR>';
			w+='by <A HREF="'+ul[l]+'javagame/dust';
				if(1==v)	w+='/search/'	 +'?o=v&e=2&k=0&t=a&m=0&p=0&s='+encodeURIComponent(hrc2(nm));
				else		w+='2/search.php'+'?o=v&e=2&k=0&t=a&m=0&p=0&s='+encodeURIComponent(hrc2(nm));
			w+='" CLASS="save_a" TITLE="'+nm+nt[l]+'">'+nm+'<\/A><BR>';
			w+=d[(i*6+4)];
		w+='<\/DIV>';
	}
	document.write(w);
}
function ranger_party(l,m,d,o,c){
	var nm=['名前','Name'],me=['変更','Edit'],pa=['パーティー','Party'],cm=['コメント','Comment'],wi=['勝','Win'];
	var lo=['敗','Lose'],ra=['勝率','Rate'],da=['日付','Date'],ur=['\/','\/en\/'],sd=['現在のセーブデータ','Current saved data'];
	var ed=['変更','Edit'],de=['削除','Delete'],rs=['1','2','3','4','5','6','7','8','9','S','-'];
	var st=' STYLE="WIDTH:4ch;PADDING:0 0 0 3px;"';
	var w='<DIV CLASS="retbl" STYLE="MARGIN:0 -9px 14px;"><TABLE STYLE="TEXT-ALIGN:left;MARGIN:0 auto;MAX-WIDTH:100%;">';
		w+='<TR STYLE="BORDER-BOTTOM:1px solid #d86a24;">';
			w+='<TD CLASS="w1">';
				if(0===m)		w+='No';
				else if(2===m)	w+='<DIV CLASS="w11">No<\/DIV><DIV CLASS="w12">'+me[l]+'<\/DIV>';
				else if(3===m)	w+='<DIV CLASS="w11">No<\/DIV><DIV CLASS="w12"><\/DIV>';
			w+='<\/TD>';
			w+='<TD CLASS="w2">';
				if(2<=m){
					w+='<DIV CLASS="w21">Rank<\/DIV><DIV CLASS="w22">Lv<\/DIV>';
				}else{
					w+='<DIV CLASS="w21">'+nm[l]+'<\/DIV>';
					w+='<DIV CLASS="w22"><DIV CLASS="w221">Rank<\/DIV><DIV CLASS="w222">Lv<\/DIV><\/DIV>';
				}
			w+='<\/TD>';
			w+='<TD CLASS="w3" ALIGN="center">'+pa[l]+'<\/TD>';
			w+='<TD CLASS="w4">';
				w+='<DIV CLASS="w41">'+cm[l]+'<\/DIV>';
				w+='<DIV CLASS="w42">';
					w+='<DIV'+st+'>'+wi[l]+'<\/DIV>';
					w+='<DIV'+st+'>'+lo[l]+'<\/DIV>';
					w+='<DIV'+st+'>'+ra[l]+'<\/DIV>';
				w+='<\/DIV>';
				w+='<DIV CLASS="w43">'+da[l]+'<\/DIV>';
			w+='<\/TD>';
			w+=(2===m?'<TD CLASS="w5">'+de[l]+'<\/TD>':'<TH CLASS="w5"><\/TH>');
		w+='<\/TR>';
		for(var i=0; i<c; i++){
			w+='<TR STYLE="BORDER-BOTTOM:1px solid #d86a24;">';
				w+='<TD CLASS="w1">';
					if(0===m){
						w+=(o+i+1);
					}else if(2===m){
						w+='<DIV CLASS="w11">'+(0!=d[(i*15+3)]?(o+i+1):'')+'<\/DIV>';
						w+='<DIV CLASS="w12">';
							w+='<INPUT TYPE="RADIO" NAME="cg"'+(d[(i*15+13)]===d[(c*15)]?' CHECKED':'')+' VALUE="'+d[(i*15+13)]+'">';
						w+='<\/DIV>';
					}else if(3===m){
						w+='<DIV CLASS="w11">'+(0!=d[(i*15+3)]?(o+i+1):'')+'<\/DIV><DIV CLASS="w12"><\/DIV>';
					}
				w+='<\/TD>';
				w+='<TD CLASS="w2">';
					if(2<=m){
						w+='<DIV CLASS="w21">R:'+rs[d[(i*15+1)]]+'<\/DIV><DIV CLASS="w22">L:'+d[(i*15+2)]+'<\/DIV>';
					}else{
						w+='<DIV CLASS="w21">';
							if(0===m)	w+='<U ONCLICK="post(0,2,{s:hrc(this)});">'+utf8_hex(d[(i*15+0)])+'<\/U>';
							else		w+=utf8_hex(d[(i*15+0)]);
						w+='<\/DIV>';
						w+='<DIV CLASS="w22">';
							w+='<DIV CLASS="w221">R:'+rs[d[(i*15+1)]]+'<\/DIV><DIV CLASS="w222">L:'+d[(i*15+2)]+'<\/DIV>';
						w+='<\/DIV>';
					}
				w+='<\/TD>';
				w+='<TD CLASS="w3">';
					if(0===d[(i*15+3)]){
						w+='<DIV CLASS="w31" STYLE="BACKGROUND:#000;WIDTH:100%;">cookie<\/DIV>';
					}else{
						var bg1=[12,8,4,0],bg2=[4,5,6,7];
						for(var j=0; j<4; j++)
							w+='<DIV CLASS="w31" STYLE="BACKGROUND:-'+((d[(i*15+3)]>>bg1[j]&0xf)*24-22)+'px 0px #'+d[i*15+bg2[j]]+' url(\/images\/r_pl.png?2)"><\/DIV>';
					}
				w+='<\/TD>';
				w+='<TD CLASS="w4">';
					w+='<DIV CLASS="w41">'+(''==d[(i*15+8)]?sd[l]:utf8_hex(d[(i*15+8)]))+'<\/DIV>';
					w+='<DIV CLASS="w42">';
						w+='<DIV'+st+'>'+d[(i*15+9)]+'<\/DIV>';
						w+='<DIV'+st+'>'+d[(i*15+10)]+'<\/DIV>';
						w+='<DIV'+st+'>'+('  '+d[(i*15+11)]).slice(-3)+'%<\/DIV>';
					w+='<\/DIV>';
					w+='<DIV CLASS="w43"><SPAN STYLE="FONT-SIZE:10px;LINE-HEIGHT:11px;">'+d[(i*15+12)]+'<\/SPAN><\/DIV>';
				w+='<\/TD>';
				w+='<TH CLASS="w5">';
					switch (d[i*15+14]){
						case 1:	w+='<U ONCLICK="post(0,1,{vs:\''+d[(i*15+13)]+'\'});">VS<\/U>';										break;
						case 2:	w+='<U ONCLICK="post(0,1,{vs:\''+d[(i*15+13)]+'\'});"><FONT STYLE="COLOR:#0a0">Win<\/FONT><\/U>';	break;
						case 3:	w+='<U ONCLICK="post(0,1,{vs:\''+d[(i*15+13)]+'\'});"><FONT STYLE="COLOR:#e00">Lose<\/FONT><\/U>';	break;
						case 4:	w+='<A HREF="'+ur[l]+'javagame\/ranger\/player.html">'+ed[l]+'<\/A>';								break;
						case 5:	w+='<A HREF="javascript:void(0)" ONCLICK="return dt_click('+d[(i*15+13)]+');">'+de[l]+'<\/A>';		break;
					}
				w+='<\/TH>';
			w+='<\/TR>';
		}
	w+='<\/TABLE><\/DIV>';
	document.write(w);
}
function logibox_search(v,l,d,c,p){
	var i,j,k,b;
	var nm=['作者','Author'],ct=['タイトル','Title'],wi=['幅','W'],he=['高','H'],le=['難易度','Level'],pt=['票数','Vote'];
	var cl=['クリア','Clear'],tm=['日付','Date'],pb=['プレイ','Play'],ur=['\/','\/en\/'],nt=['の作品',' is works'];
	var w='<TABLE CELLSPACING="0" STYLE="MARGIN:0 auto 1em;">';
		w+='<TR STYLE="BORDER-BOTTOM:1px solid #d86a24;TEXT-ALIGN:left;">';
			w+='<TD STYLE="TEXT-ALIGN:center;MIN-WIDTH:5ch;MAX-WIDTH:5ch;PADDING:0 4px 0 0;">No<\/TD>';
			w+='<TD CLASS="logi_w2">';
				w+='<DIV CLASS="logi_w21"><DIV CLASS="logi_w211">'+nm[l]+'<\/DIV><DIV CLASS="logi_w212">'+ct[l]+'<\/DIV><\/DIV>';
				var lal=[wi,		he,		le,			pt,		cl,		tm];
				var stl=['2ch',		'2ch',	'6ch',		'4ch',	'3em',	'17ch'];
				var ali=['right',	'right','center',	'right','right','center'];
				var szs=[''	,		'',		'',			'',		'',		'FONT-SIZE:10px;"><SPAN STYLE="FONT-SIZE:12px;'];
				var sze=[''	,		'',		'',			'',		'',		'<\/SPAN>'];
				for(i=0; i<6; i++)
					w+='<DIV STYLE="DISPLAY:inline-block;PADDING:0 4px 0 0;MIN-WIDTH:'+stl[i]+';MAX-WIDTH:'+stl[i]+';TEXT-ALIGN:'+ali[i]+';'+szs[i]+'">'+lal[i][l]+sze[i]+'<\/DIV>';
			w+='<\/TD>';
			if(0===v){
				w+='<TD STYLE="MIN-WIDTH:25px;MAX-WIDTH:25px;PADDING:0 4px 0 0;"><\/TD>';
				w+='<TD STYLE="FONT-SIZE:16px;FONT-WEIGHT:bold;WIDTH:3em;"><\/TD>';
			}
		w+='<\/TR>';
		for(i=0;i<c;i++){
			d[(i*11+1)] = utf8_hex(d[(i*11+1)]);
			d[(i*11+2)] = utf8_hex(d[(i*11+2)]);
			w+='<TR STYLE="HEIGHT:27px;BORDER-BOTTOM:1px solid #d86a24;TEXT-ALIGN:left;">';
				w+='<TD STYLE="TEXT-ALIGN:center;MIN-WIDTH:5ch;MAX-WIDTH:5ch;PADDING:0 4px 0 0;">'+d[(i*11+0)]+'<\/TD>';
				w+='<TD CLASS="logi_w2">';
					w+='<DIV CLASS="logi_w21"><DIV CLASS="logi_w211">';
						if(0===v){
							w+='<A HREF="'+ur[l]+'javagame\/logibox\/search.php?p=0&o=n&e=2&k=0&t=a&m=0&l=a&w0=&w1=&h0=&h1=&b=&s='+encodeURIComponent(hrc2(d[(i*11+1)]))+'" TITLE="'+d[(i*11+1)]+nt[l]+'">';
								w+=d[(i*11+1)];
							w+='<\/A>';
						}else{
							w+=d[(i*11+1)];
						}
					w+='<\/DIV><DIV CLASS="logi_w212">'+d[(i*11+2)]+'<\/DIV><\/DIV>';
					var mw=['2ch',	'2ch',	'6ch',		'4ch',	'3em',	'17ch'];
					var ta=['right','right','center',	'right','right','center;FONT-SIZE:10px'];
					var no=[3,		4,		5,			6,		7,		8];
					for(j=0; j<6; j++)
						w+='<DIV STYLE="DISPLAY:inline-block;PADDING:0 4px 0 0;MIN-WIDTH:'+mw[j]+';MAX-WIDTH:'+mw[j]+';TEXT-ALIGN:'+ta[j]+';">'+d[(i*11+no[j])]+'<\/DIV>';
				w+='<\/TD>';
				if(0===v){
					w+='<TD STYLE="LINE-HEIGHT:0;FONT-SIZE:0;MIN-WIDTH:25px;MAX-WIDTH:25px;HEIGHT:27px;TEXT-ALIGN:center;PADDING:0 4px 0 0;">';
						if(1==d[(i*11+9)]){
							b='';
							w+='<DIV STYLE="DISPLAY:inline-block;WIDTH:'+d[(i*11+3)]+'px;HEIGHT:'+d[(i*11+4)]+'px;WHITE-SPACE:normal;MARGIN:0 auto;">';
								for(j=0;j<d[(i*11+10)].length;j++)
									b+=('000'+parseInt(d[(i*11+10)][j],16).toString(2)).slice(-4);
								for(j=0;j<d[(i*11+4)];j++)
									for(k=0;k<d[(i*11+3)];k++)
										w+='<DIV STYLE="DISPLAY:inline-block;WIDTH:1px;HEIGHT:1px;BACKGROUND:#'+(b.charAt(j*d[i*11+3]+k) ==='0'?'fff6d4':'111111')+';"><\/DIV>';
							w+='<\/DIV>';
						}
					w+='<\/TD>';
					w+='<TD STYLE="FONT-SIZE:16px;LINE-HEIGHT:18px;FONT-WEIGHT:bold;COLOR:#00F;WIDTH:3em;TEXT-ALIGN:center;WHITE-SPACE:pre;PADDING:0;">';
						w+='<A HREF="'+ur[l]+'javagame\/logibox\/?no='+d[(i*11+0)]+'" TITLE="Game No.'+d[(i*11+0)]+' ｢'+d[(i*11+2)]+'｣" ONCLICK="post_u=[\''+ur[l]+'javagame\/logibox\/?no='+d[(i*11+0)]+'\'];post(0,0,{p:\''+p+'\'});return false;"';
							if(1===d[(i*11+9)])	w+=' STYLE="COLOR:#F00;">'+cl[l];
							else				w+='>'+pb[l];
						w+='<\/A>';
					w+='<\/TD>';
				}
			w+='<\/TR>';
		}
	w+='<\/TABLE>'+(0===v?'<BR>':'');
	document.write(w);
}
function utf8_hex(t){
	var r=[],l=t.length;
	for(var i=0;i<l;i+=2)
		r.push(parseInt(t.substr(i,2),16));
	t=r;
	r='';
	while(j=t.shift()){
		if(j<=0x7f){
			r+=String.fromCharCode(j);
		}else if(j<=0xdf){
			r+=String.fromCharCode(((j&0x1f)<<6)|(t.shift()&0x3f));
		}else if(j<=0xe0){
			r+=String.fromCharCode(((t.shift()&0x1f)<<6)|0x0800|(t.shift()&0x3f));
		}else{
			r+=String.fromCharCode(((j&0x0f)<<12)|((t.shift()&0x3f)<<6)|(t.shift()&0x3f));
		}
	}
	return r;
}
function hrc(r){
	r=r.innerHTML;
	r=r.replace(/&amp;/g,	'&').
		replace(/&quot;/g,	'"').
		replace(/&#039;/g,	"'").
		replace(/&lt;/g,	'<').
		replace(/&gt;/g,	'>');
	return r;
}
function hrc2(r){
	r=r.replace(/&amp;/g,	'&').
		replace(/&quot;/g,	'"').
		replace(/&#039;/g,	"'").
		replace(/&lt;/g,	'<').
		replace(/&gt;/g,	'>');
	return r;
}
function hu_tag(id,lg){
	var w='',ck=cookie_get('user');
	var v=[['復活の呪文','Save game'],['ゲット','Get'],['セット','Set'],['<A HREF="/entry/" TITLE="ユーザー登録">ユーザー登録</A>が必要です。','<A HREF="/en/entry/" TITLE="User registration">User registration</A> is required.']];
	if(ck[3]!=''){
		w+='<TABLE ID="htbl"><TR><TH>'+v[0][lg]+'<\/TH><TD><TEXTAREA ID="bun" ONCLICK="this.select();"><\/TEXTAREA><\/TD><TH>';
			w+='<INPUT TYPE="SUBMIT" VALUE="'+v[1][lg]+'" ONCLICK="save(\''+id+'\')" ONMOUSEDOWN="';
				w+='document.getElementById(\'bun\').value=\'\';document.getElementById(\'pass\').innerHTML=\'　\';';
			w+='">';
			w+='<INPUT TYPE="SUBMIT" VALUE="'+v[2][lg]+'" ONCLICK="load(\''+id+'\')" ONMOUSEDOWN="';
				w+='document.getElementById(\'pass\').innerHTML=\'　\';';
			w+='">';
		w+='<\/TH><\/TR><\/TABLE><DIV id="pass" STYLE="HEIGHT:14px;"><\/DIV><BR>';
	}else{
		w+='<TABLE CLASS="ctbl" STYLE="MARGIN:0 auto;"><TR><TH><B>'+v[0][lg]+'<\/B><\/TH><TD>'+v[3][lg]+'<\/TD><\/TR><\/TABLE>';
		w+='<BR>';
	}
	document.getElementById('hu_tag').innerHTML=w;
}
function save(id){
	var s=GameSave('0'),h='Error';

	if(s!=''){
		document.getElementById('bun').value=s;
		h='Get OK';
	}
	document.getElementById('pass').innerHTML=h;
}
function load(id){
	document.getElementById('bun').value=document.getElementById('bun').value.replace(/\x0D\x0A|\x0D|\x0A/g,'');
	var s=document.getElementById('bun').value,ret=-1,h='Error';
	if(s!=='')	ret=GameLoad(s);
	if(ret!==-1)	h='Set OK';
	document.getElementById('pass').innerHTML=h;
}
function timer(id,u,t){
	try{
		var s=AutoSave('0');
		if(s!=''){
			var time=new Date(0).toGMTString();
			document.cookie='save='+s+'; expires='+time+'; path='+u+'\/ja; ';
			document.cookie='save='+s+'; expires='+time+'; path='+u+'\/ja\/; ';
			document.cookie='save='+s+'; expires='+time+'; path='+u.substr(0,-1)+'; ';
			time=new Date(new Date().getTime()+(1000*3600*24*30*3)).toGMTString();
			document.cookie='save='+s+'; expires='+time+'; path='+u+'; ';
		}
	}catch(e){
	}
	setTimeout("timer('"+id+"','"+u+"',"+t+")",t);
}
function gs_cookie_fr(){
	var fr='',i,str,cke,fra;
	if(document.cookie){
		cke=document.cookie.split('; ');
		for(i=0;i<cke.length;i++){
			str=cke[i].split('=');
			if(str[0]=='favorites')	fr=str[1];
		}
	}
	if(!fr)	fr=' ';
	fra=fr.split(' ');
	fr='';
	for(i=0;i<fra.length;i++){
		if(fra[i]<9999999){
			fr+=(fr?' ':'')+fra[i];
		}
	}
	return fr;
}
function gs_cookie_set(set){
	var nw=Date.now();
	var ep=new Date(nw+(1000*3600*24*30)).toGMTString();
	var co='favorites='+nw+' '+set+'; expires='+ep+'; path=/';
	document.cookie=co+'search/; ';
	document.cookie=co+'en/search/; ';
}
function gs_cookie_ck(){
	var fr='',i,str,cke;
	if(document.cookie){
		cke=document.cookie.split('; ');
		for(i=0;i<cke.length;i++){
			str=cke[i].split('=');
			if(str[0]=='favorites')	fr=str[1];
		}
	}
	fr=fr.split(' ');
	if(fr[0]<(new Date().getTime()-(1000*3600*24)))
		gs_cookie_set(gs_cookie_fr());
}
function gs_entry(no,ln,url){
	var fr=gs_cookie_fr(),fra,re,cke='',w='',fln=document.getElementById('f'+ln),i,mx=100;
	if(-1==(' '+fr+' ').indexOf(' '+no+' ')){
		fra=fr.split(" ");
		re=new RegExp("^[0-9]+$");
		fra.push(no);
		for(i=0;i<mx;i++){
			if(re.test(fra[i])){
				cke+=fra[i]+' ';
				if(i<21){
					w+='<A HREF="'+url+'search/jump.php?no='+fra[i]+'" TARGET="_blank">';
					w+='<IMG SRC="/images/search/'+fra[i]+'.png" WIDTH="40px" HEIGHT="30px" CLASS="favorites_img">';
					w+='</A>';
				}
			}
		}
		gs_cookie_set(cke.slice(0,-1));

		fln.innerHTML='______________';
		document.getElementById('favorites').innerHTML=w;
	}
}
function gs_edit(no,mv,lg){
	var fra=gs_cookie_fr().split(" "),cke='',w='',i,mx=100;

	no=no+'';
	if(mv===2){
		for(i=0;i<mx;i++){
			if(fra[i]==no && fra[i-1]>0)
				[fra[i],fra[i-1]]=[fra[i-1],fra[i]];
		}
	}else if(mv===3){
		for(i=mx-1;i>=0;i--){
			if(fra[i]==no && fra[i+1]>0)
				[fra[i],fra[i+1]]=[fra[i+1],fra[i]];
		}
	}else{
		for(i=0;i<mx;i++){
			if(fra[i]==no)
				fra[i]='undefined';
		}
	}

	var s=['削除','Delete'],re=new RegExp("[0-9]+"),as='<A HREF="javascript:gs_edit(',tl=','+lg+')">';
	for(i=0;i<mx;i++){
		if(fra[i]!=undefined && re.test(fra[i])){
			cke+=fra[i]+' ';
			w+='<DIV CLASS="edit_div"><IMG SRC="/images/search/'+fra[i]+'.png" WIDTH="120" HEIGHT="90">';
				w+=as+fra[i]+',2'+tl+'&lt;&lt;</A>　 ';
				w+=as+fra[i]+',0'+tl+s[lg]+'</A>　 ';
				w+=as+fra[i]+',3'+tl+'&gt;&gt;</A>';
			w+='</DIV>';
		}
	}
	gs_cookie_set(cke.slice(0,-1));

	document.getElementById('edit').innerHTML=w;
}
function gs_del_no(no){
	var fra=gs_cookie_fr().split(" "),ck='',re=new RegExp("[0-9]+"),i,mx=100;

	for(i=0;i<mx;i++){
		if(fra[i]!=undefined && re.test(fra[i]) && no[fra[i]]!=1)
			ck+=fra[i]+' ';
	}

	gs_cookie_set(ck.slice(0,-1));
}
function post(u_no,v_no,v){
	var i,f=document.createElement('form');
	document.body.appendChild(f);
	for(var k in post_v[v_no])
		v[k]=post_v[v_no][k];
	for(var k in v){
		i=document.createElement('input');
		i.type='hidden';
		i.name=k;
		i.value=v[k];
		f.appendChild(i);
	}
	f.action=post_u[u_no];
	f.method='post';
	f.submit();
}
function top_blank(){
	var i=0,l=document.links,c=document.links.length;
	for(;i<c;i++)
		if(l[i].target!='dframe' && l[i].target!='_blank')
			l[i].target='_top';
	try{
		var p=parent.location.href;
	}catch(e){
	}
	var m=location.href;
	if(p!=m){
		var w=0,h=0;
		if(window.innerWidth){
			w=window.innerWidth;
			h=window.innerHeight;
		}else if(document.documentElement && document.documentElement.clientWidth!=0){
			w=document.documentElement.clientWidth;
			h=document.documentElement.clientHeight;
		}else if(document.body){
			w=document.body.clientWidth;
			h=document.body.clientHeight;
		}
		if(w<800)
			parent.location.href=m;
		if((w==996 && h==896) || (w==1000 && h==900))
			parent.location.href=m;
	}
}

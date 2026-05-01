const pool = require('../../config/db');



exports.gethuodongApiList=async (req,res)=>{
try{
  const [list]=await pool.execute('select * from huodong')
  res.json({ code: 200, data: list, msg: '获取活动成功' });
}
catch(err){
  console.error(err);
  res.status(500).json({ code: 500, msg: '服务器错误' });
}

}


exports.getzixunApiList=async (req,res)=>{
try{
  const [list]=await pool.execute('select * from zixun')
  res.json({ code: 200, data: list, msg: '获取资讯成功' });
}
catch(err){
  console.error(err);
  res.status(500).json({ code: 500, msg: '服务器错误' });
}

}
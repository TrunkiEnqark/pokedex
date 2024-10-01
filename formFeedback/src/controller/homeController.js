const getHomepage = (req,res) => {
  res.send('Hello World node! nha hehe');
}
const getTAK = (req,res) => {
  res.render('index');
}
module.exports = {
  getHomepage,
  getTAK
}

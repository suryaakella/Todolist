const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true})
const todolistSchema = mongoose.Schema({name: String})
const Todolist = mongoose.model('TodoList', todolistSchema);
const date = require(__dirname + '/date.js');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const listSchema = mongoose.Schema({name: String, items:[todolistSchema]})
const item1 = new Todolist({name: "<- Check to delete the item"})
const defaultitems = [item1];
const List = mongoose.model("List", listSchema);

app.get('/', function(req, res){
    const today = date.getDate();
    Todolist.find({},function(err, data){
        if(err) {console.log(err);}
        else { 
            const todolist=[]
            res.render("list", {today: "Today", todolist:data});
        }
    })    
})

app.post('/', function(req, res){
    const item = req.body.newitem;
    const customListName = req.body.list;
    const todolistitem = new Todolist({name: item});

    if(customListName === "Today"){
    todolistitem.save();
    res.redirect('/');
    }
    else{
        List.findOne({name: customListName}, function(err, results){
            if(!err){
                results.items.push(todolistitem);
                results.save();
                res.redirect('/' + customListName); 
            }
            else {
                console.log("error");
            }
        })
    }
})

app.post('/delete', function(req, res){
    const id = req.body.checkbox
    if (req.body.list === "Today"){
        Todolist.findByIdAndDelete(id, function(err){console.log(err)})
        res.redirect('/');
    }
    else{
        List.findOneAndUpdate({name: req.body.list}, {$pull: {items: {_id: id}}}, function(err, foundlist){
            res.redirect('/' + req.body.list)
        })
    }

})

app.get('/:customListName', function(req, res){
    const customListName = req.params.customListName;
    console.log(req.params.customListName)
    List.findOne({name: customListName}, function(err, results){
        if(!err){
            if(!results){
            const list = new List({
                name: customListName,
                items: defaultitems
            });
            list.save();
            res.redirect('/' + customListName);
            }
            else {
            res.render("list", {today: results.name, todolist: results.items}) 
            }
        }
        else {
            console.log("error");

        }
    })

})


let port  = process.env.PORT;
if(port == null || port ==""){
    port = 3000;
}
app.listen(port, function(){
console.log("server started at port 3000");
})
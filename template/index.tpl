<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        /*
         * 对于注释也是应该有消除的
         * 此模板针对//和/**/进行处理
         * 而对于html本有的<!---->就不进行处理了
         *
         */
        <h1>this 5 test!</h1>

        // 下面是对模板的解析
        // if/for等的逻辑都是一样的
        // 变量读取的逻辑也一样

        <h2>if的测试</h2>
        <% if(data.id < 100) { %>
            hello <% data.name %> !
        <% }else{ %>
            <h2>error!</h2>
        <% } %>

        <hr/>

        <h2>for的测试</h2>
        <% for(var i=0;i<10;i++) { %>
            <% i %>
        <% } %>

        <hr/>

        <h2>while的测试</h2>
        <% var j = 0; %>
        <% while(j < 5) { %>
            <i><%j++%></i>
        <% } %>

        <hr/>
        <h2>do-while的测试</h2>
        <% do{ %>
            <% j %>
        <% }while(j++<10); %>

        <hr/>


        //switch不推荐写在模板中，因为书写不足够美观，并且完全可以用if来代替
        <%
            switch(j){
                case 11:
        %>
                <%data.id%>
        <%
                    break;

                default:break;
            }
        %>

        <form action = "./index03" method="post"/>
            <input type="text" name="age" value="1"/>
            <input type="submit"/>
        </form>

        <script src="./js/jquery-1.8.3.min.js"></script>
        <script>
            $.ajax({
                url: "./index/100/zysuper",
                type: "get",
                dataType: "json",
                success: function(data){
                    alert(data.name);
                }
            });
        </script>
    </body>
    <!--this is test-->
</html>
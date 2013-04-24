using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace jsgames.Controllers
{
    public class GameOfLifeController : Controller
    {
        //
        // GET: /GameOfLife/

        public ActionResult Index()
        {
            return View();
        }

    }
}

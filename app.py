from flask import Flask, render_template
from api.routes import api   # 🔥 VERY IMPORTANT

app = Flask(__name__)

# 🔥 REGISTER API BLUEPRINT (THIS WAS MISSING)
app.register_blueprint(api)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    print("🔥 Starting Flask server...")
    app.run(host="0.0.0.0", port=5000)

workflow "New workflow" {
  on = "push"
  resolves = ["alias"]
}

action "deploy" {
  uses = "actions/zeit-now@9fe84d557939d277e0d98318b625bd48d364a89b"
  runs = "now"
  args = "--token $NOW_TOKEN"
  env = {
    NOW_TOKEN = "2OZfW5VNcTsm88rwHxxFDCAR"
  }
}

action "alias" {
  uses = "actions/zeit-now@9fe84d557939d277e0d98318b625bd48d364a89b"
  runs = "now alias"
  args = "--token $NOW_TOKEN"
  env = {
    NOW_TOKEN = "2OZfW5VNcTsm88rwHxxFDCAR"
  }
  needs = ["deploy"]
}

terraform {
  required_version = ">= 1.1.8"

  required_providers {
    fastly = {
      source  = "fastly/fastly"
      version = ">= 1.1.2"
    }
  }
}

// see https://developer.fastly.com/learning/integrations/orchestration/terraform/

// https://registry.terraform.io/providers/fastly/fastly/latest/docs
provider "fastly" {
  // We use `FASTLY_API_KEY` envvar instead of `api_key`
}

// https://registry.terraform.io/providers/fastly/fastly/latest/docs/resources/service_compute
resource "fastly_service_compute" "canary" {
  // TODO: Set an actual service name,
  name = "demofastly_canary"

  // TODO: Set an actual service domain.
  domain {
    name    = "demo.notexample.com"
    comment = "demo"
  }

  // TODO: Set an actual backend.
  backend {
    address = "127.0.0.1"
    name    = "localhost"
    port    = 80
  }

  package {
    filename         = "../../pkg/fastly-compute-at-edge-template.tar.gz"
    source_code_hash = filesha512("../../pkg/fastly-compute-at-edge-template.tar.gz")
  }
}
